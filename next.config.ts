import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Hosts allowed to request `/_next/*` dev resources.
   *
   * Next blocks cross-origin access to dev resources by default. That default
   * is measured against `localhost`, so opening the dev server from another
   * device on the LAN — a phone at `http://192.168.1.29:3737` — gets a 403 on
   * every JavaScript chunk and the HMR socket. The HTML still renders, so the
   * failure is silent and looks like a broken app: no hydration means every
   * scroll-reveal stays at its `initial` opacity and no event handler ever
   * attaches (menus stop opening).
   *
   * Listing the LAN origins here restores real-device testing. Development
   * only — production builds serve static assets with no such restriction, so
   * this has no effect on deploys.
   */
  /*
   * Listed as whole private ranges rather than individual addresses.
   *
   * This previously pinned two literal IPs. Both were stale: the Wi-Fi adapter
   * is on DHCP and had since moved to 10.73.207.115, which was not listed, so
   * every `/_next/*` chunk requested from a phone returned 403. The HTML still
   * renders, so the page *looks* like it loaded while no JavaScript ever runs —
   * nothing hydrates, no handler attaches, scroll reveals sit at their initial
   * opacity, and the HMR socket reconnects in a loop. It reads as a desperately
   * slow, broken site rather than as an error, which is exactly how it was
   * reported.
   *
   * `*` matches exactly one hostname label, so one `*` per octet covers a
   * range. These are the three RFC1918 private ranges plus mDNS names. A DHCP
   * lease can now move freely inside them without breaking device testing.
   *
   * `172.*.*.*` is marginally wider than the real private block
   * (172.16–172.31); octet ranges can't be expressed, and the alternative is
   * sixteen entries for no practical gain.
   *
   * Development only — `next start` serves static assets with no origin check,
   * so none of this reaches production.
   */
  allowedDevOrigins: [
    "10.*.*.*", // Wi-Fi / Ethernet on a 10.0.0.0/8 LAN
    "192.168.*.*", // the usual home-router range
    "172.*.*.*", // Docker and Hyper-V virtual switches
    "*.local", // mDNS hostnames (e.g. my-pc.local)
  ],
};

export default nextConfig;
