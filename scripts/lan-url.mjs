#!/usr/bin/env node
/**
 * Prints the URLs to hand to a phone, tablet or second computer.
 *
 * The Wi-Fi adapter is on DHCP, so the address changes whenever the lease
 * does. Anything written down goes stale, and a stale address is the single
 * most common reason "it worked yesterday" — hence a command rather than a
 * note. Run it with `npm run lan`.
 *
 * Also checks the one thing people forget: whether the firewall rules from
 * scripts/enable-lan-testing.ps1 are actually in place. Without them the
 * address below is correct and still unreachable, which is impossible to
 * diagnose from the device's end — a phone just shows a timeout.
 *
 * No dependencies: this has to work before `npm install` has finished too.
 */

import { networkInterfaces, platform } from "node:os";
import { execFileSync } from "node:child_process";

const PORT = Number(process.env.PORT ?? 3000);

const colour = {
  reset: "\u001b[0m",
  dim: "\u001b[2m",
  cyan: "\u001b[36m",
  green: "\u001b[32m",
  yellow: "\u001b[33m",
  bold: "\u001b[1m",
};

/**
 * Usable IPv4 addresses, best candidate first.
 *
 * Filtered out:
 *   - internal (loopback) addresses, which no other device can reach;
 *   - 169.254.x.x link-local, which means the adapter never got a DHCP lease;
 *   - Hyper-V / WSL / Docker virtual switches, whose addresses look perfectly
 *     valid and are reachable only by the virtual machines behind them. Handing
 *     one of these to a phone is the classic false start.
 */
function candidateAddresses() {
  const found = [];

  for (const [name, addresses] of Object.entries(networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (address.family !== "IPv4" || address.internal) continue;
      if (address.address.startsWith("169.254.")) continue;
      if (/^(vEthernet|Loopback|WSL|Docker|VirtualBox|VMware)/i.test(name)) continue;

      found.push({ name, ip: address.address });
    }
  }

  // Wi-Fi first: the test device is almost always on the same Wi-Fi.
  return found.sort((a, b) => {
    const score = (n) => (/wi-?fi|wlan/i.test(n) ? 0 : /ethernet/i.test(n) ? 1 : 2);
    return score(a.name) - score(b.name);
  });
}

/** True when the firewall rules this project installs are present and on. */
function firewallRulesPresent() {
  if (platform() !== "win32") return null;

  try {
    const output = execFileSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        "(Get-NetFirewallRule -Group 'Altivance dev servers' -ErrorAction SilentlyContinue | Where-Object Enabled -eq 'True').Count",
      ],
      { encoding: "utf8", timeout: 20_000, stdio: ["ignore", "pipe", "ignore"] },
    );

    return Number(output.trim()) > 0;
  } catch {
    // Could not ask. Say "unknown" rather than claim either answer.
    return null;
  }
}

const addresses = candidateAddresses();

console.log("");
console.log(`${colour.bold}  Test this site on another device${colour.reset}`);
console.log(`${colour.dim}  --------------------------------${colour.reset}`);
console.log("");

if (addresses.length === 0) {
  console.log(
    `${colour.yellow}  No usable network address. Connect to Wi-Fi and run this again.${colour.reset}`,
  );
} else {
  for (const { name, ip } of addresses) {
    console.log(
      `    ${colour.cyan}http://${ip}:${PORT}${colour.reset}   ${colour.dim}(${name})${colour.reset}`,
    );
  }
}

console.log("");

const firewall = firewallRulesPresent();

if (firewall === true) {
  console.log(`${colour.green}  ✓ Firewall rules are in place.${colour.reset}`);
} else if (firewall === false) {
  console.log(
    `${colour.yellow}  ! Firewall rules are missing — other devices will time out.${colour.reset}`,
  );
  console.log(
    `${colour.dim}    Run once, in an elevated PowerShell:${colour.reset}`,
  );
  console.log(
    `    ${colour.cyan}powershell -ExecutionPolicy Bypass -File scripts\\enable-lan-testing.ps1${colour.reset}`,
  );
} else {
  console.log(
    `${colour.dim}  Could not check the firewall rules. If the device times out, see${colour.reset}`,
  );
  console.log(`${colour.dim}  scripts/enable-lan-testing.ps1.${colour.reset}`);
}

console.log("");
console.log(
  `${colour.dim}  The device must be on the same Wi-Fi as this PC. Address changes when${colour.reset}`,
);
console.log(`${colour.dim}  the DHCP lease does, so re-run this if it stops working.${colour.reset}`);
console.log("");
