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
  allowedDevOrigins: [
    "192.168.1.29", // this machine on the local network
    "172.26.144.1", // Hyper-V virtual switch adapter
    "*.local", // mDNS hostnames (e.g. my-pc.local)
  ],
};

export default nextConfig;
