import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/ui/WhatsAppFloat";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";
import { ScrollProgress } from "@/components/motion/ScrollProgress";

/**
 * Only the weights the design actually uses are requested — each one is a
 * separate woff2 download, which is felt most on a phone.
 *
 * Playfair drops 800: `font-extrabold` appears nowhere in the codebase, and
 * `font-black` (900) is what the headings actually use (64 occurrences).
 * DM Sans drops 300: `font-light` appears nowhere either.
 *
 * `Inter` used to be loaded here as `--font-sans` and was never referenced
 * again — not by globals.css, not by a `font-sans` utility, nowhere. It cost a
 * whole extra family on every page load for nothing, so it is gone.
 */
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "900"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://apexacademicconsultancy.com"),
  title: {
    default: "Apex Academic Consultancy | Where Academic Excellence Meets Results",
    template: "%s | Apex Academic Consultancy",
  },
  description:
    "Nigeria's premier academic consultancy. Expert project writing, editing, proofreading, research assistance, study abroad guidance, and more. Transform your academic journey today.",
  keywords: [
    "academic consultancy",
    "project writing",
    "thesis editing",
    "proofreading",
    "research assistance",
    "study abroad",
    "SPSS analysis",
    "assignment help",
    "scholarship guidance",
    "admission guidance",
    "Nigeria academic consultant",
  ],
  authors: [{ name: "Apex Academic Consultancy" }],
  creator: "Apex Academic Consultancy",
  publisher: "Apex Academic Consultancy",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://apexacademicconsultancy.com",
    siteName: "Apex Academic Consultancy",
    title: "Apex Academic Consultancy | Where Academic Excellence Meets Results",
    description:
      "Transform your academic journey with Nigeria's most trusted consultancy. Expert project writing, research assistance, study abroad guidance, and more.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Apex Academic Consultancy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Apex Academic Consultancy",
    description:
      "Where Academic Excellence Meets Results. Nigeria's premier academic consultancy.",
    images: ["/og-image.jpg"],
    creator: "@apexacademic",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable}`}
      /*
        The bootstrap script below adds `.dark` to this element while the
        browser is still parsing <head> — before React hydrates. That is the
        documented Next.js way to avoid a theme flash, and it necessarily means
        the client's className differs from the server's. `suppressHydrationWarning`
        tells React that difference is intentional *for this element only*; it
        does not extend to children, so a genuine mismatch anywhere else in the
        tree is still reported.
      */
      suppressHydrationWarning
    >
      <head>
        {/*
          Theme bootstrap. Must run before first paint and therefore cannot be
          a React effect — by the time an effect fires the browser has already
          painted, and a dark-mode user would see a white flash on every single
          navigation. `beforeInteractive` is not enough either; this has to be
          synchronous and inline in <head>.

          No longer flags `theme-ready`: the colour transition it used to gate
          is now applied only while a switch is actually in flight (see
          `.theme-transition` in globals.css and ThemeToggle). Leaving a live
          transition on every element for the whole session was costing a ~2.8x
          style-recalculation penalty on every frame.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />

        {/* Icons are no longer declared by hand. `src/app/icon.png` and
            `src/app/apple-icon.png` are picked up by Next's file conventions,
            which emit correctly-sized, content-hashed <link> tags. The previous
            manual tags pointed at /favicon.ico and /apple-touch-icon.png —
            neither file existed, so both 404'd on every page load. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: "Apex Academic Consultancy",
              alternateName: "Apex Academic",
              url: "https://apexacademicconsultancy.com",
              logo: "https://apexacademicconsultancy.com/logo.png",
              description:
                "Nigeria's premier academic consultancy offering project writing, research assistance, study abroad guidance, and more.",
              address: {
                "@type": "PostalAddress",
                addressCountry: "NG",
              },
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+234-708-432-1204",
                contactType: "customer service",
                availableLanguage: "English",
              },
              sameAs: [
                "https://wa.me/2347084321204",
              ],
            }),
          }}
        />
      </head>
      <body className="bg-canvas text-ink-950 antialiased">
        {/*
          Failsafe for scroll-reveal content.

          Framer Motion serialises each reveal's `initial` state into the SSR
          HTML as an inline `opacity: 0`, which means every animated element
          depends on JavaScript to ever become visible. With JS disabled — or
          blocked by a proxy, or broken on an old browser — the page renders
          blank.

          `<noscript>` covers the JS-disabled case declaratively and costs
          nothing when scripts do run. `!important` is required: it has to beat
          the inline styles Framer wrote.
        */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html: `
                [style*="opacity:0"],
                [style*="opacity: 0"] {
                  opacity: 1 !important;
                  transform: none !important;
                  filter: none !important;
                  clip-path: none !important;
                }
              `,
            }}
          />
        </noscript>

        {/* Keyboard users land here first; the fixed header would otherwise
            swallow several tab stops before any page content. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-xl focus:bg-surface focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-ink-950 focus:shadow-layered focus:outline-none focus:ring-2 focus:ring-gold-500"
        >
          Skip to content
        </a>

        {/* SmoothScrollProvider owns the rAF scroll loop and publishes scroll
            velocity/progress as MotionValues. It must wrap everything that
            reads scroll state — including the header and the progress bar. */}
        <SmoothScrollProvider>
          <ScrollProgress />
          <Navigation />
          <main id="main">{children}</main>
          <Footer />
          <WhatsAppFloat />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
