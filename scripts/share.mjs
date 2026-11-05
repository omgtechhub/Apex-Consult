#!/usr/bin/env node
/**
 * `npm run share` — build the site, serve it, and publish it on a public HTTPS
 * URL that works on any device. One command, one terminal.
 *
 * WHY A PRODUCTION BUILD AND NOT THE DEV SERVER
 * ---------------------------------------------
 * `next dev` with Turbopack deliberately does not bundle: it serves the app as
 * many small modules so rebuilds stay fast. That is the right trade on
 * localhost and the wrong one through a tunnel, where every request pays
 * network latency. Measured on this project, one home-page load:
 *
 *     npm run dev       29 requests   5.81 MB
 *     this script       18 requests   1.22 MB
 *
 * On top of that, `next dev` compiles each route on first request (6–14s
 * through a tunnel), re-optimises images per request instead of caching them,
 * and ships the dev overlay and HMR client. On a phone that reads as a site
 * which loads slowly and then stays sluggish — chronically, because none of
 * that cost is ever paid off.
 *
 * WHY NOT VS CODE PORT FORWARDING
 * -------------------------------
 * Dev Tunnels rewrites every response to `Cache-Control: no-cache,no-store`,
 * unconditionally — even a font the origin marked `immutable` — so nothing the
 * visitor loads can ever be reused. It also shows an anti-phishing interstitial
 * whose "Continue" button sets a `SameSite=None` cookie from JavaScript, which
 * iOS Safari discards, so on an iPhone it loops forever. Cloudflare passes
 * cache headers through untouched and shows no interstitial.
 * See README-SHARING.md.
 *
 * USAGE
 *   npm run share                 # build, serve on :3100, tunnel it
 *   npm run share -- --dev        # tunnel the dev server on :3000 instead
 *   npm run share -- --skip-build # reuse the last build (refuses if stale)
 *   npm run share -- --port 4000  # serve the build on another port
 *   npm run share -- --skip-build --force-stale
 *                                 # reuse a build that is older than the source
 */

import { spawn, spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { createConnection } from "node:net";
import { join, relative } from "node:path";
import process from "node:process";

/**
 * Next's CLI entry point, run through this same Node binary.
 *
 * Not `spawn("next", …, { shell: true })`. On Windows `next` resolves to a
 * `.cmd`, which cannot be executed without a shell — and passing arguments
 * through a shell concatenates rather than escapes them, which Node now warns
 * about (DEP0190). Calling the CLI's JS entry point directly avoids the shell
 * altogether: no warning, no quoting hazard, and the child is a real Node
 * process we can signal.
 */
const NEXT_BIN = join(process.cwd(), "node_modules", "next", "dist", "bin", "next");

const BINARY = join(process.cwd(), "tools", "cloudflared.exe");
const DIST_DIR = ".next-preview";
const BUILD_PORT = 3100;
const DEV_PORT = 3000;
const DOWNLOAD_URL =
  "https://github.com/cloudflare/cloudflared/releases/download/2026.10.7/cloudflared-windows-amd64.exe";

const colour = {
  reset: "\u001b[0m",
  dim: "\u001b[2m",
  bold: "\u001b[1m",
  cyan: "\u001b[36m",
  green: "\u001b[32m",
  yellow: "\u001b[33m",
  red: "\u001b[31m",
};

/* -------------------------------------------------------------------------- */
/*  Arguments                                                                 */
/* -------------------------------------------------------------------------- */

const argv = process.argv.slice(2);
const useDevServer = argv.includes("--dev");
const skipBuild = argv.includes("--skip-build");
const forceStale = argv.includes("--force-stale");

function flagValue(...names) {
  for (const name of names) {
    const index = argv.indexOf(name);
    if (index !== -1 && argv[index + 1]) return argv[index + 1];
    const inline = argv.find((a) => a.startsWith(`${name}=`));
    if (inline) return inline.slice(name.length + 1);
  }
  return undefined;
}

const port = Number(
  flagValue("--port", "-p") ?? (useDevServer ? DEV_PORT : BUILD_PORT),
);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`${colour.red}Invalid port: ${port}${colour.reset}`);
  process.exit(1);
}

/* -------------------------------------------------------------------------- */
/*  Child process bookkeeping                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Every long-lived child, so none can outlive this script.
 *
 * Windows does not terminate children when a parent dies, and both failure
 * modes were observed here: an orphaned cloudflared leaves the site publicly
 * reachable with no obvious process to find, and an orphaned `next start`
 * holds the port so the next run refuses to build.
 */
const children = new Set();
let shuttingDown = false;

function stopAll() {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (child.exitCode !== null || child.killed) continue;

    child.kill("SIGTERM");

    if (process.platform === "win32" && child.pid) {
      try {
        // Synchronous on purpose: during `exit` the event loop is already
        // closed, so anything asynchronous would never run. `/T` takes the
        // whole tree, since `next start` spawns its own children.
        spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
          stdio: "ignore",
        });
      } catch {
        // Best effort; the SIGTERM above is the primary path.
      }
    }
  }
}

process.on("exit", stopAll);

for (const sig of ["SIGINT", "SIGTERM", "SIGHUP", "SIGBREAK"]) {
  process.on(sig, () => {
    stopAll();
    process.exit(0);
  });
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function portIsOpen(p, timeout = 1500) {
  return new Promise((resolve) => {
    const socket = createConnection({ host: "127.0.0.1", port: p });
    const done = (result) => {
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(timeout);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false));
    socket.once("error", () => done(false));
  });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Polls until the server answers, so the tunnel never opens onto a dead port.
 *
 * The `sleep` is the whole point, and its absence was a real bug: a connection
 * to a loopback port nothing is listening on is *refused* in about a
 * millisecond. It does not wait out `portIsOpen`'s timeout, which only covers
 * a port that accepts and then says nothing. So with no pause between attempts
 * the loop spent all 90 tries in under a tenth of a second and announced "the
 * server never came up on :3100" while `next start` was still booting — it
 * needs one to two seconds. The failure looked like a dead server and was
 * really a stopwatch that ran 900x too fast.
 *
 * One second per attempt makes the count an honest deadline: ~90 seconds.
 */
async function waitForPort(p, attempts = 90) {
  for (let i = 0; i < attempts; i += 1) {
    if (await portIsOpen(p, 1000)) return true;
    await sleep(1000);
  }
  return false;
}

/**
 * PIDs listening on a TCP port, for error messages only.
 *
 * `netstat -ano` rather than a dependency: it is present on every Windows
 * install and this is a diagnostic, so a wrong or empty answer must degrade to
 * printing nothing rather than failing the run. Non-Windows returns nothing;
 * there the orphan case does not arise, because the shell's job control
 * terminates the process group.
 */
function pidsOnPort(p) {
  if (process.platform !== "win32") return [];
  try {
    const out = spawnSync("netstat", ["-ano"], { encoding: "utf8" });
    if (out.status !== 0 || !out.stdout) return [];
    const pids = new Set();
    for (const line of out.stdout.split(/\r?\n/)) {
      if (!line.includes("LISTENING")) continue;
      // Match the local-address column only, so a remote peer on the same
      // port number is never reported as the holder.
      if (!new RegExp(`^\\s*TCP\\s+\\S*:${p}\\s`).test(line)) continue;
      const pid = line.trim().split(/\s+/).pop();
      if (/^\d+$/.test(pid) && pid !== "0") pids.add(pid);
    }
    return [...pids];
  } catch {
    return [];
  }
}

/* -------------------------------------------------------------------------- */
/*  Build freshness                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Inputs whose modification means the build on disk is out of date.
 *
 * `public/` is deliberately absent: `next start` serves it straight from disk
 * on every request, so new images or fonts are live without a rebuild. Only
 * things that are *compiled into* the output belong here.
 */
const BUILD_INPUT_DIRS = ["src"];
const BUILD_INPUT_FILES = [
  "next.config.ts",
  "next.config.js",
  "next.config.mjs",
  "package.json",
  "tsconfig.json",
  "postcss.config.mjs",
  "postcss.config.js",
];

/** Newest mtime under a directory tree, with the file that owns it. */
function newestIn(dir, acc) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }

  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      acc = newestIn(full, acc);
      continue;
    }
    if (!entry.isFile()) continue;
    try {
      const { mtimeMs } = statSync(full);
      if (mtimeMs > acc.mtimeMs) acc = { mtimeMs, path: full };
    } catch {
      // Raced with an editor writing the file; the next run will catch it.
    }
  }
  return acc;
}

/**
 * Is the build in `DIST_DIR` older than the source that produced it?
 *
 * WHY THIS EXISTS
 * ---------------
 * `--skip-build` does exactly what it says, and that is the trap: it reuses
 * whatever is in `.next-preview` with no indication of how old that is. A build
 * from the previous day serves yesterday's CSS and yesterday's components over
 * a brand-new tunnel URL, so every symptom you just fixed is still there, on a
 * link that looks freshly generated. Restarting the tunnel does not help —
 * there was never anything wrong with the tunnel.
 *
 * That failure is expensive precisely because it is silent: the page loads,
 * nothing errors, and the only evidence is a timestamp nobody thinks to check.
 * So the check is not a warning buried in the log — a stale build is refused
 * outright, and `--force-stale` is there for when reusing one is the point.
 *
 * mtime, not a content hash: it is one `stat` per source file against one
 * `stat` on BUILD_ID, it needs no state kept between runs, and the question
 * being asked really is "has anything been touched since the build".
 */
function buildFreshness() {
  const buildId = join(process.cwd(), DIST_DIR, "BUILD_ID");
  if (!existsSync(buildId)) return { exists: false };

  const builtAt = statSync(buildId).mtimeMs;

  let newest = { mtimeMs: 0, path: null };
  for (const dir of BUILD_INPUT_DIRS) {
    newest = newestIn(join(process.cwd(), dir), newest);
  }
  for (const file of BUILD_INPUT_FILES) {
    const full = join(process.cwd(), file);
    try {
      const { mtimeMs } = statSync(full);
      if (mtimeMs > newest.mtimeMs) newest = { mtimeMs, path: full };
    } catch {
      // Optional config file that this project does not use.
    }
  }

  return {
    exists: true,
    builtAt,
    newestAt: newest.mtimeMs,
    newestPath: newest.path,
    stale: newest.mtimeMs > builtAt,
  };
}

function formatAge(ms) {
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"}`;
  const hours = ms / 3600000;
  if (hours < 24) return `${hours.toFixed(1)} hours`;
  return `${(hours / 24).toFixed(1)} days`;
}

/** Refuses to serve a build that predates the source, unless --force-stale. */
function assertBuildIsFresh() {
  const f = buildFreshness();
  if (!f.exists || !f.stale) return f;

  const rel = f.newestPath ? relative(process.cwd(), f.newestPath) : "a source file";
  const gap = formatAge(f.newestAt - f.builtAt);

  if (forceStale) {
    console.log("");
    console.log(
      `${colour.yellow}  WARNING: serving a build that is ${gap} older than the source.${colour.reset}`,
    );
    console.log(`${colour.dim}  Newest change not in it: ${rel}${colour.reset}`);
    console.log(`${colour.dim}  You passed --force-stale, so continuing.${colour.reset}`);
    return f;
  }

  console.error("");
  console.error(
    `${colour.red}  The build in ${DIST_DIR} is out of date — refusing to share it.${colour.reset}`,
  );
  console.error("");
  console.error(
    `${colour.dim}  Built           ${new Date(f.builtAt).toLocaleString()}${colour.reset}`,
  );
  console.error(
    `${colour.dim}  Last edit       ${new Date(f.newestAt).toLocaleString()}  (${gap} newer)${colour.reset}`,
  );
  console.error(`${colour.dim}  Newest file     ${rel}${colour.reset}`);
  console.error("");
  console.error(
    `${colour.dim}  \`--skip-build\` reuses this build as-is, so the link would serve${colour.reset}`,
  );
  console.error(
    `${colour.dim}  that older code and none of the changes above it. Drop the flag:${colour.reset}`,
  );
  console.error("");
  console.error(`    ${colour.cyan}npm run share${colour.reset}`);
  console.error("");
  console.error(
    `${colour.dim}  Or, to share the old build deliberately:${colour.reset}`,
  );
  console.error(
    `    ${colour.cyan}npm run share -- --skip-build --force-stale${colour.reset}`,
  );
  console.error("");
  process.exit(1);
}

function runNext(args, env, stdio = "inherit") {
  return spawn(process.execPath, [NEXT_BIN, ...args], {
    env,
    stdio,
    cwd: process.cwd(),
  });
}

function runToCompletion(args, env) {
  return new Promise((resolve, reject) => {
    const child = runNext(args, env);
    children.add(child);
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      children.delete(child);
      if (signal || code === 0) return resolve(0);
      reject(new Error(`next ${args[0]} exited with code ${code}`));
    });
  });
}

/* -------------------------------------------------------------------------- */
/*  Preflight                                                                 */
/* -------------------------------------------------------------------------- */

if (!existsSync(BINARY)) {
  console.error("");
  console.error(`${colour.red}  tools/cloudflared.exe is missing.${colour.reset}`);
  console.error("");
  console.error(
    `${colour.dim}  One portable binary, ~53 MB, nothing installed:${colour.reset}`,
  );
  console.error(`    ${colour.cyan}curl -L -o tools/cloudflared.exe \\${colour.reset}`);
  console.error(`      ${colour.cyan}${DOWNLOAD_URL}${colour.reset}`);
  console.error("");
  process.exit(1);
}

console.log("");
console.log(`${colour.bold}  Share this site${colour.reset}`);
console.log(`${colour.dim}  ---------------${colour.reset}`);

/* -------------------------------------------------------------------------- */
/*  Serve                                                                     */
/* -------------------------------------------------------------------------- */

if (useDevServer) {
  if (!(await portIsOpen(port))) {
    console.error("");
    console.error(
      `${colour.red}  --dev was passed but nothing is listening on :${port}.${colour.reset}`,
    );
    console.error(
      `${colour.dim}  Start it first:  ${colour.cyan}npm run dev${colour.reset}`,
    );
    console.error("");
    process.exit(1);
  }

  console.log(
    `${colour.yellow}  Tunnelling the DEV server on :${port} — expect it to be slow on a phone.${colour.reset}`,
  );
  console.log(
    `${colour.yellow}  Drop --dev for the production build (5x less to download).${colour.reset}`,
  );
} else {
  const alreadyServing = await portIsOpen(port);

  if (alreadyServing && !skipBuild) {
    console.error("");
    console.error(
      `${colour.red}  Port ${port} is already serving a build.${colour.reset}`,
    );
    console.error("");
    console.error(
      `${colour.dim}  Rebuilding would delete the files that server is still handing out,${colour.reset}`,
    );
    console.error(
      `${colour.dim}  and the site would then load with no CSS at all. Stop it with Ctrl-C${colour.reset}`,
    );
    console.error(`${colour.dim}  in its terminal and run this again.${colour.reset}`);

    /*
      Name the process, because "Ctrl-C in its terminal" is useless advice for
      the case that actually happens.

      On Windows a parent does not reap its children, so Ctrl-C here (or closing
      the window) can leave `next start` holding the port with no terminal
      attached to interrupt. The port then stays occupied by a server nobody can
      see, this message sends you looking for a window that no longer exists,
      and the obvious move — rerun with `--skip-build` — silently reuses that
      orphan and serves whatever build it booted from. Printing the PID turns a
      dead end into one command.
    */
    for (const pid of pidsOnPort(port)) {
      console.error("");
      console.error(
        `${colour.dim}  Holding port ${port}: PID ${pid}. If it has no terminal, end it with:${colour.reset}`,
      );
      console.error(`    ${colour.cyan}taskkill /PID ${pid} /T /F${colour.reset}`);
    }

    console.error("");
    console.error(
      `${colour.dim}  Reusing it instead will serve the build it already has, not a new one:${colour.reset}`,
    );
    console.error(`    ${colour.cyan}npm run share -- --skip-build${colour.reset}`);
    console.error("");
    process.exit(1);
  }

  const env = { ...process.env, NEXT_DIST_DIR: DIST_DIR };

  if (!alreadyServing) {
    if (skipBuild) {
      if (!existsSync(join(process.cwd(), DIST_DIR, "BUILD_ID"))) {
        console.error("");
        console.error(
          `${colour.red}  --skip-build was passed but ${DIST_DIR} holds no build.${colour.reset}`,
        );
        console.error("");
        process.exit(1);
      }
      // Exits unless the build is at least as new as every source file.
      const f = assertBuildIsFresh();
      console.log(
        `${colour.dim}  Reusing the existing build in ${DIST_DIR}${
          f.builtAt ? ` (built ${new Date(f.builtAt).toLocaleString()})` : ""
        }.${colour.reset}`,
      );
    } else {
      console.log("");
      console.log(`${colour.dim}  Building (a minute or two) …${colour.reset}`);
      console.log("");
      try {
        await runToCompletion(["build"], env);
      } catch {
        // Next has already printed the actual error above; a Node stack trace
        // on top of it only buries the line that matters.
        console.error("");
        console.error(`${colour.red}  The build failed — see the error above.${colour.reset}`);
        console.error("");
        process.exit(1);
      }
    }

    console.log("");
    console.log(`${colour.dim}  Starting the server on :${port} …${colour.reset}`);

    /**
     * `next start`'s stderr is captured, not discarded.
     *
     * It used to be `stdio: "ignore"`, which swallowed the one line that
     * explains a failure. A port taken between the check above and this spawn
     * made `next start` exit instantly with EADDRINUSE, and all the user saw
     * was "The server never came up on :3100" — true, unhelpful, and pointing
     * at the wrong thing.
     */
    const server = runNext(
      ["start", "-H", "0.0.0.0", "-p", String(port)],
      env,
      ["ignore", "pipe", "pipe"],
    );
    children.add(server);

    /**
     * Both streams, not just stderr. Next prints its banner and some startup
     * failures to stdout, so ignoring stdout is what made the one failure this
     * script can hit report no detail at all.
     */
    let serverError = "";
    const collect = (c) => {
      serverError = (serverError + c.toString()).slice(-4000);
    };
    server.stdout?.on("data", collect);
    server.stderr?.on("data", collect);

    server.on("exit", (code) => {
      if (shuttingDown) return;
      console.error("");
      console.error(
        `${colour.red}  The site server stopped (code ${code}).${colour.reset}`,
      );
      const detail = serverError.trim();
      if (detail) {
        console.error("");
        console.error(detail.replace(/^/gm, "    "));
      }
      if (/EADDRINUSE/i.test(serverError)) {
        console.error("");
        console.error(
          `${colour.dim}  Something grabbed port ${port} after the check. Free it, or pick another:${colour.reset}`,
        );
        console.error(
          `    ${colour.cyan}npm run share -- --port 3200${colour.reset}`,
        );
      }
      console.error("");
      process.exit(1);
    });

    if (!(await waitForPort(port))) {
      console.error("");
      console.error(`${colour.red}  The server never came up on :${port}.${colour.reset}`);
      const detail = serverError.trim();
      if (detail) {
        console.error("");
        console.error(detail.replace(/^/gm, "    "));
      }
      console.error("");
      process.exit(1);
    }
  } else {
    /*
      Reusing a server this script did not start.

      This is the other silent path to serving old code, and the one that makes
      a stale link look unfixable: Ctrl-C in the share terminal kills the tunnel
      and this script, but an orphaned `next start` can keep holding the port
      (Windows does not reap children when a parent dies). The next
      `--skip-build` run then finds the port open, reuses that process, prints a
      fresh tunnel URL — and serves whatever build that server booted from.
      Killing the link and re-running looks like it should help and cannot.

      So the same freshness check applies here, and the served build is dated in
      the log, because the number that matters is the one nobody thinks to look
      up.
    */
    const f = assertBuildIsFresh();
    console.log(
      `${colour.dim}  Reusing the server already on :${port}${
        f.builtAt ? `, serving the build from ${new Date(f.builtAt).toLocaleString()}` : ""
      }.${colour.reset}`,
    );
    console.log(
      `${colour.dim}  That process was not started by this run — if it predates the${colour.reset}`,
    );
    console.log(
      `${colour.dim}  build on disk, stop it (Ctrl-C in its terminal) and use \`npm run share\`.${colour.reset}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/*  Tunnel                                                                    */
/* -------------------------------------------------------------------------- */

console.log(
  `${colour.dim}  Opening a TryCloudflare tunnel — no account, no warning page.${colour.reset}`,
);

const tunnel = spawn(
  BINARY,
  ["tunnel", "--no-autoupdate", "--url", `http://localhost:${port}`],
  // No `shell: true`: BINARY is an absolute path, so nothing reaches a shell.
  { stdio: ["ignore", "pipe", "pipe"] },
);
children.add(tunnel);

let announced = false;

/**
 * cloudflared logs everything to stderr, including the assigned hostname.
 *
 * Matched against an accumulated buffer rather than each chunk on its own: a
 * chunk is however much of the pipe arrived at once, not a line, so the
 * hostname can straddle two of them and match neither.
 */
let tunnelLog = "";

function scan(chunk) {
  tunnelLog = (tunnelLog + chunk.toString()).slice(-8000);

  if (announced) return;

  const match = tunnelLog.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
  if (!match) return;

  announced = true;

  console.log("");
  console.log(`${colour.green}${colour.bold}  Share this link:${colour.reset}`);
  console.log("");
  console.log(`    ${colour.cyan}${colour.bold}${match[0]}${colour.reset}`);
  console.log("");
  console.log(
    `${colour.dim}  Any device — iPhone, Android, any PC. No sign-in, no warning page.${colour.reset}`,
  );
  console.log(
    `${colour.yellow}  New link each run. Ctrl-C stops the site and the tunnel together.${colour.reset}`,
  );
  console.log("");
}

tunnel.stdout.on("data", scan);
tunnel.stderr.on("data", scan);

tunnel.on("error", (error) => {
  console.error("");
  console.error(
    `${colour.red}  Could not start cloudflared: ${error.message}${colour.reset}`,
  );
  console.error("");
  process.exit(1);
});

tunnel.on("exit", (code, signal) => {
  if (signal || shuttingDown) process.exit(0);

  if (!announced) {
    console.error("");
    console.error(
      `${colour.red}  cloudflared stopped before it published a link (code ${code}).${colour.reset}`,
    );
    const detail = tunnelLog.trim();
    if (detail) {
      console.error("");
      console.error(detail.replace(/^/gm, "    "));
    }
    console.error("");
  }

  process.exit(code ?? 0);
});
