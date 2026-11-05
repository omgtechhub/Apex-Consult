#!/usr/bin/env node
/**
 * `npm run preview` — build the site and serve it for sharing through a tunnel.
 *
 * WHY THIS EXISTS
 * ---------------
 * Forwarding the *dev server's* port (VS Code → Ports → Forward a Port) does
 * work, but it is close to unusable on someone else's device, and the reason is
 * not obvious from either end. Measured against this project on a live Dev
 * Tunnel:
 *
 *   - The relay REWRITES every response's cache headers to
 *     `Cache-Control: no-cache,no-store`. It does this unconditionally — even a
 *     font that the server marked `public, max-age=31536000, immutable` comes
 *     out of the tunnel uncacheable. So the visiting browser is forbidden from
 *     caching anything, and re-downloads the entire site on every page view and
 *     every client-side navigation.
 *
 *   - Each request costs roughly 1–4s through the relay, against 0.15s locally.
 *
 *   - `next dev` with Turbopack deliberately does NOT bundle: it serves the app
 *     as many small chunks so rebuilds stay fast. The home page alone pulls 28
 *     separate JS/CSS files, and each new route is compiled on first request
 *     (6–14s through the tunnel).
 *
 * Multiply those together — ~30 uncacheable requests at 1–4s each, repeated on
 * every navigation — and a phone spends a minute or more on a page that never
 * finishes hydrating. If any single chunk is dropped, React never hydrates at
 * all and the page just sits there, styled but completely dead. That is the
 * "I shared the port and it doesn't work" failure, and no amount of config
 * fixes it, because the cost is per-request and the request count is the
 * problem.
 *
 * A production build removes the cause rather than working around it. Measured
 * on this project, one home-page load drops from 29 requests / 5.81 MB in dev
 * to 18 requests / 1.22 MB — 4.8x less data — because the app is bundled
 * instead of served as loose modules. Every route is also compiled up front,
 * so nothing pays the first-request compile cost, and there is no HMR socket
 * and no dev overlay. The tunnel still refuses to let anything cache, but
 * there is far less to fetch and far less to drop mid-hydration.
 *
 * WHY A SEPARATE BUILD DIRECTORY AND PORT
 * ---------------------------------------
 * So this never disturbs the dev server. Building into the live `.next` while
 * `next dev` is running desynchronises the dev server's chunk graph and breaks
 * the page it is serving. This builds into `.next-preview` and serves on its
 * own port, so `npm run dev` can stay up on :3000 the whole time.
 *
 * USAGE
 *   npm run preview              # build, then serve on :3100
 *   npm run preview -- --port 4000
 *   npm run preview -- --skip-build   # re-serve the last preview build
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createConnection } from "node:net";
import { join } from "node:path";
import process from "node:process";

const DIST_DIR = ".next-preview";
const DEFAULT_PORT = 3100;

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

function flagValue(...names) {
  for (const name of names) {
    const index = argv.indexOf(name);
    if (index !== -1 && argv[index + 1]) return argv[index + 1];

    const inline = argv.find((a) => a.startsWith(`${name}=`));
    if (inline) return inline.slice(name.length + 1);
  }
  return undefined;
}

const port = Number(flagValue("--port", "-p") ?? process.env.PREVIEW_PORT ?? DEFAULT_PORT);
const skipBuild = argv.includes("--skip-build");

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`${colour.red}Invalid port: ${port}${colour.reset}`);
  process.exit(1);
}

/* -------------------------------------------------------------------------- */
/*  Running Next                                                              */
/* -------------------------------------------------------------------------- */

/**
 * `NEXT_DIST_DIR` is read by next.config.ts and must be set for BOTH the build
 * and the serve, or `next start` looks in `.next` and reports a missing build.
 */
const env = { ...process.env, NEXT_DIST_DIR: DIST_DIR };

/**
 * `shell: true` on Windows: `next` resolves to `next.cmd` in node_modules/.bin,
 * and `spawn` without a shell cannot execute a `.cmd`. Every argument here is
 * built from a validated integer or a literal, so there is nothing
 * interpolated that a shell could reinterpret.
 */
function run(args, label) {
  return new Promise((resolve, reject) => {
    const child = spawn("next", args, {
      env,
      stdio: "inherit",
      shell: true,
      cwd: process.cwd(),
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      // Ctrl-C is the intended way to stop the server, not a failure.
      if (signal) return resolve(0);
      if (code === 0) return resolve(0);
      reject(new Error(`${label} exited with code ${code}`));
    });
  });
}

/* -------------------------------------------------------------------------- */

function banner() {
  console.log("");
  console.log(`${colour.bold}  Shareable preview build${colour.reset}`);
  console.log(`${colour.dim}  ------------------------${colour.reset}`);
  console.log(
    `${colour.dim}  A production build, served on its own port so the dev server on${colour.reset}`,
  );
  console.log(`${colour.dim}  :3000 is untouched.${colour.reset}`);
  console.log("");
}

function nextSteps() {
  console.log("");
  console.log(`${colour.green}  Serving on port ${port}.${colour.reset}`);
  console.log("");
  console.log(`${colour.bold}  To share it:${colour.reset}`);
  console.log(`    1. VS Code → ${colour.cyan}Ports${colour.reset} panel → ${colour.cyan}Forward a Port${colour.reset} → ${colour.cyan}${port}${colour.reset}`);
  console.log(`    2. Right-click the row → ${colour.cyan}Port Visibility${colour.reset} → ${colour.cyan}Public${colour.reset}`);
  console.log(`${colour.dim}       Without this, anyone you send the link to hits a GitHub sign-in wall.${colour.reset}`);
  console.log(`    3. Copy the ${colour.cyan}Forwarded Address${colour.reset} and send it on.`);
  console.log("");
  console.log(
    `${colour.dim}  It will work on any device, anywhere — no same-Wi-Fi requirement.${colour.reset}`,
  );
  console.log("");
}

/* -------------------------------------------------------------------------- */

/**
 * Is something already serving on this port?
 *
 * Rebuilding while a previous `npm run preview` is still running is actively
 * destructive, and the failure is baffling. `next start` keeps serving the
 * build it loaded and reads chunk files from disk on demand, but a rebuild
 * writes new content-hashed filenames and deletes the old ones. The running
 * server then hands out HTML referencing `<hash>.css` that no longer exists,
 * the browser gets a 500 for the stylesheet, and the site renders with NO CSS
 * at all — which looks like a catastrophic layout bug rather than a stale
 * server. Observed exactly this way.
 *
 * So: refuse to build over a live server, and say what to do instead.
 */
function portIsOpen(p) {
  return new Promise((resolve) => {
    const socket = createConnection({ host: "127.0.0.1", port: p });
    const done = (result) => {
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(1500);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false));
    socket.once("error", () => done(false));
  });
}

banner();

if (!skipBuild && (await portIsOpen(port))) {
  console.error(
    `${colour.red}  Port ${port} is already serving a preview build.${colour.reset}`,
  );
  console.error("");
  console.error(
    `${colour.dim}  Building now would delete the files that server is still handing out,${colour.reset}`,
  );
  console.error(
    `${colour.dim}  and the site would load with no CSS at all. Stop it first (Ctrl-C in${colour.reset}`,
  );
  console.error(`${colour.dim}  its terminal), then run this again.${colour.reset}`);
  console.error("");
  console.error(`${colour.dim}  Or serve the existing build without rebuilding:${colour.reset}`);
  console.error(`    ${colour.cyan}npm run preview -- --skip-build${colour.reset}`);
  console.error("");
  process.exit(1);
}

try {
  if (skipBuild) {
    if (!existsSync(join(process.cwd(), DIST_DIR, "BUILD_ID"))) {
      console.error(
        `${colour.red}  No previous preview build in ${DIST_DIR}. Run without --skip-build.${colour.reset}`,
      );
      process.exit(1);
    }
    console.log(`${colour.dim}  Reusing the existing build in ${DIST_DIR}.${colour.reset}`);
  } else {
    console.log(`${colour.dim}  Building into ${DIST_DIR} … (a minute or two)${colour.reset}`);
    console.log("");
    await run(["build"], "next build");
  }

  nextSteps();

  // Binds every interface, so the forwarded port and same-Wi-Fi devices both
  // reach it. `next start` applies no cross-origin asset check, so there is no
  // allowedDevOrigins equivalent to keep in step here.
  await run(["start", "-H", "0.0.0.0", "-p", String(port)], "next start");
} catch (error) {
  console.error("");
  console.error(`${colour.red}  ${error.message}${colour.reset}`);
  console.error("");
  process.exit(1);
}
