import type { NextConfig } from "next";

/**
 * Build output directory.
 *
 * Overridable so a shareable production build can be made WITHOUT clobbering
 * the running dev server's `.next`. Building into the same directory while
 * `next dev` is live desynchronises the dev server's chunk graph and breaks the
 * page it is serving, which is why `npm run preview` sets this to
 * `.next-preview` instead. See scripts/preview.mjs.
 */
const distDir = process.env.NEXT_DIST_DIR?.trim() || ".next";

/**
 * Hostnames used to reach this app from somewhere other than this machine.
 *
 * VS Code's "Ports" panel (Forward a Port) publishes the dev server through
 * Microsoft Dev Tunnels at `https://<id>-<port>.<region>.devtunnels.ms`, which
 * is how this project is shared for testing on other devices. The others are
 * the common alternatives, kept so switching tunnel provider is a one-line
 * change rather than a debugging session.
 */
const tunnelHosts = [
  "**.devtunnels.ms", // VS Code "Forward a Port" / Dev Tunnels
  "**.ngrok-free.app", // ngrok, free tier
  "**.ngrok.io", // ngrok, legacy
  "**.ngrok.app", // ngrok, paid domains
  "**.trycloudflare.com", // cloudflared quick tunnels
  "**.loca.lt", // localtunnel
];

const nextConfig: NextConfig = {
  distDir,

  images: {
    /**
     * Candidate widths offered to the browser for `fill` / `sizes` images.
     *
     * 3840 is removed, and that is the whole point of this block. The widest
     * source in `public/images` is 2560px (hero-library, hero-library-soft);
     * most are 2000–2400. Next clamps optimizer output to the source width, so
     * a `w=3840` request returns *byte-for-byte the same image* as `w=2048`
     * for a 2000px source — but under a different URL, which means a different
     * cache key and a second optimizer job. Any 2x-DPR laptop picks the 3840
     * candidate off `sizes="100vw"`, so the hero photograph every page opens
     * with was being generated and cached twice over, once per device class,
     * for identical pixels.
     *
     * Verified on this project's own optimizer:
     *   student-focus  w=2048 -> 220,901 bytes   w=3840 -> 220,901 bytes
     *
     * Capping at 2048 makes every high-DPR device share one cache entry, and
     * costs nothing visually because there are no pixels above 2560 to show.
     * Add 3840 back only alongside genuinely 4K-wide source images.
     */
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],

    /**
     * Next 16 changed `qualities` from "anything goes" to an allowlist whose
     * default is `[75]`, and a `q` outside it is coerced to the nearest member
     * (a direct `/_next/image` request with one returns 400). So the 60 that
     * `BackdropImage` asks for has to be declared here or it silently becomes
     * 75 again — the failure is invisible, which is exactly why it is worth a
     * comment. 75 stays for foreground imagery (blog covers, the logo), which
     * is looked at directly rather than through a scrim.
     */
    qualities: [60, 75],
  },

  /**
   * Hosts allowed to request `/_next/*` development resources.
   *
   * WHY THIS IS NEEDED
   * Next blocks cross-origin access to dev resources by default, and "same
   * origin" is measured against `localhost`. Open the dev server from a
   * forwarded port or another device and every JavaScript chunk plus the HMR
   * socket return 403. The HTML still renders, so the failure is completely
   * silent and looks like a broken, half-loaded app rather than an error:
   * nothing hydrates, no event handler attaches (menus stop opening), and
   * every scroll-reveal sits frozen at its `initial` opacity.
   *
   * WHY RANGES, NOT ADDRESSES
   * This list once held two literal IPs. Both went stale within days, because
   * the Wi-Fi adapter is on DHCP and the lease moves. A literal address here
   * is a trap that re-breaks device testing silently and at random.
   *
   * `*` matches exactly one hostname label, so one `*` per octet covers a
   * whole range. Octet *ranges* cannot be expressed, which is why `172.*.*.*`
   * is marginally wider than the real private block (172.16–172.31) — the
   * alternative is sixteen entries for no practical gain.
   *
   * DEVELOPMENT ONLY. `next start` serves static assets with no origin check,
   * so none of this reaches production.
   */
  allowedDevOrigins: [
    // ── Tunnels: the primary way this project is shared for testing ─────────
    ...tunnelHosts,

    // ── The three RFC1918 private ranges, for same-Wi-Fi testing ───────────
    "10.*.*.*", // Wi-Fi / Ethernet on a 10.0.0.0/8 LAN
    "192.168.*.*", // the usual home-router range
    "172.*.*.*", // Docker and Hyper-V virtual switches

    // ── Carrier-grade NAT ───────────────────────────────────────────────────
    // 100.64.0.0/10. Used by Tailscale, and by phone tethering on some
    // Nigerian networks.
    "100.*.*.*",

    // ── Link-local ──────────────────────────────────────────────────────────
    // 169.254.x.x means the adapter has no DHCP lease, so it rarely works —
    // but a direct Ethernet cable between two machines lands here, and a 403
    // is a far more confusing failure than a timeout.
    "169.254.*.*",

    // ── Name-based access ───────────────────────────────────────────────────
    "*.local", // mDNS hostnames, e.g. my-pc.local
    "localhost",
  ],

  experimental: {
    /**
     * Server Actions are POSTs, and Next defends them against CSRF by
     * comparing the `Origin` header with the `Host` header, aborting the
     * request when they differ. The admin area (sign-in, post editor) runs on
     * Server Actions.
     *
     * A tunnel forwards its own hostname as `Host`, so Origin and Host already
     * agree and the check passes. This list is the belt to that braces: it
     * keeps the admin area working if a relay ever rewrites `Host` to the
     * internal address, which would otherwise fail as an unexplained
     * "Invalid Server Actions request" on every admin form — and only when
     * accessed through a tunnel, which is the worst kind of bug to chase.
     *
     * Both glob depths are listed because a dev-tunnel hostname carries two
     * variable labels (`<id>-<port>.<region>.devtunnels.ms`) and the matcher
     * used here is stricter about label counts than the one above.
     */
    serverActions: {
      allowedOrigins: [
        ...tunnelHosts,
        "*.devtunnels.ms",
        "*.*.devtunnels.ms",
      ],
    },
  },
};

export default nextConfig;
