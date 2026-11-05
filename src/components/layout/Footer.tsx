import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  BookOpen,
  Globe,
  FileText,
  BarChart3,
  Award,
} from "lucide-react";
// Reveal/Stagger are client components. Rendering them here keeps the Footer
// itself a server component — only the animation wrappers ship JS, while all
// the link markup inside stays server-rendered.
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { stagger } from "@/lib/motion";

const services = [
  { label: "Project Writing", href: "/services/project-writing" },
  { label: "Research Assistance", href: "/services/research-assistance" },
  { label: "Data Analysis (SPSS)", href: "/services/data-analysis" },
  { label: "Proofreading & Editing", href: "/services/proofreading" },
  { label: "Business Proposals", href: "/services/business-proposals" },
  { label: "CV & Statement of Purpose", href: "/services/cv-sop" },
  { label: "Admission Guidance", href: "/services/admission" },
  { label: "Study Abroad Consultancy", href: "/study-abroad" },
  { label: "Scholarship Guidance", href: "/services/scholarship" },
  { label: "Journal Formatting", href: "/services/journal-formatting" },
];

const company = [
  { label: "About Us", href: "/about" },
  { label: "Our Team", href: "/about#team" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Blog", href: "/blog" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQs", href: "/faq" },
  { label: "Resources", href: "/resources" },
  { label: "Contact", href: "/contact" },
  { label: "Make a Payment", href: "/pay" },
];

const legal = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Refund Policy", href: "/refund" },
  { label: "Cookie Policy", href: "/cookies" },
];

export function Footer() {
  return (
    <footer
      className="bg-surface-dark text-white relative overflow-hidden"
      role="contentinfo"
      aria-label="Site footer"
    >
      {/*
        ACCENT PINNING IN THIS COMPONENT — read before adding a band.
        ------------------------------------------------------------------------
        `accent-gold-fixed` is applied to the three DARK children below (this
        hairline, the column grid, the bottom bar) and deliberately NOT to
        `<footer>` itself.

        The footer is `bg-surface-dark` — dark in both themes — so its accent has
        the same problem the photographic heroes have: in light mode the brand
        ramp resolves to red, and #630303 measures 1.27:1 on this panel. The
        existing `.bg-surface-dark` rule already lifts it to #ef4444 to keep it
        visible, but that is a rescue, not a colour decision; gold is the half of
        the palette built for dark grounds and is what this footer already
        rendered after dark. Pinning it makes light mode agree.

        The reason it cannot go on `<footer>` is the newsletter strip, which is
        `bg-canvas` — a genuinely light island inside a dark component. The
        `.accent-gold-fixed` block in globals.css deliberately reaches *into*
        `:is(.bg-canvas, .bg-surface)` descendants (the hero's `bg-surface`
        button needs that), so a class on the parent would force gold onto the
        white newsletter band: its "Newsletter" eyebrow would land at about
        1.7:1 on white. Red is correct there and clears AAA.

        So the split is by ground colour, not by component. Any new band added
        here gets the class if it sits on the dark panel, and does not if it
        brings its own light surface.
      */}

      {/* Decorative gradient */}
      <div className="accent-gold-fixed absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />

      {/* Newsletter strip.

          Light, while the footer columns below stay dark. It reads as its own
          band rather than part of the footer proper, and a signup form is a
          call to action — it should sit on the same surface as every other
          conversion point on the site, not inverted from them. */}
      <div className="bg-canvas border-b border-ink-200/60">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <Reveal
            choreography="rise"
            className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8"
          >
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                <span className="text-brand-500 text-xs font-semibold tracking-[0.15em] uppercase">
                  Newsletter
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold font-display text-ink-950 mb-2">
                Academic insights, delivered.
              </h2>
              <p className="text-ink-600 text-sm leading-relaxed">
                Join 5,000+ students and researchers receiving weekly tips on academic writing,
                study abroad, and scholarship opportunities.
              </p>
            </div>
            <form className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto lg:min-w-[420px]" action="/api/newsletter" method="POST">
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
                className="flex-1 px-4 py-3 bg-surface border border-ink-200 rounded-xl text-ink-950 placeholder-ink-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/50 transition-all"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-gradient-to-r from-brand-400 to-brand-500 text-on-brand text-sm font-semibold rounded-xl hover:shadow-[0_4px_16px_rgba(99,3,3,0.35)] transition-all whitespace-nowrap flex items-center gap-2 justify-center"
              >
                Subscribe <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </Reveal>
        </div>
      </div>

      {/* Main footer. Columns arrive left-to-right so the eye lands on the
          brand first, then walks the link lists in reading order. */}
      <div className="accent-gold-fixed max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <Stagger
          each={stagger.loose}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8"
        >
          {/* Brand column */}
          <StaggerItem choreography="rise" className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2.5 mb-6 group">
              {/* The mark's lower-right wedge is black, which vanishes against
                  the ink-950 footer. A faint light plate keeps it legible
                  without boxing the logo in a hard container. */}
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] ring-1 ring-white/10 flex items-center justify-center transition-colors duration-300 group-hover:bg-white/10">
                <Image
                  src="/logo.png"
                  alt=""
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <div className="font-bold text-sm text-white font-display tracking-tight">
                  ALTIVANCE ACADEMIC
                </div>
                <div className="text-brand-500 text-[10px] font-semibold tracking-[0.15em] uppercase">
                  Consultancy
                </div>
              </div>
            </Link>
            <p className="text-ink-400 text-sm leading-relaxed mb-6 max-w-xs">
              Where Academic Excellence Meets Results. Nigeria&apos;s most trusted academic
              consultancy, empowering students and professionals since 2018.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { value: "5,000+", label: "Clients Served" },
                { value: "98%", label: "Success Rate" },
                { value: "50+", label: "Universities" },
                { value: "24/7", label: "Support" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/5 rounded-xl p-3">
                  <div className="text-brand-500 font-bold text-lg font-display">
                    {stat.value}
                  </div>
                  <div className="text-ink-600 text-xs mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Contact */}
            <div className="space-y-3">
              <a
                href="https://wa.me/2347084321204"
                className="flex items-center gap-3 text-sm text-ink-400 hover:text-brand-500 transition-colors group"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-brand-500/20 transition-colors">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                +234 708 432 1204
              </a>
              <a
                href="mailto:info@altivance.com"
                className="flex items-center gap-3 text-sm text-ink-400 hover:text-brand-500 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-brand-500/20 transition-colors">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                info@altivance.com
              </a>
              <div className="flex items-center gap-3 text-sm text-ink-400">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                Nigeria (Serving Worldwide)
              </div>
            </div>
          </StaggerItem>

          {/* Services */}
          <StaggerItem choreography="rise" className="lg:col-span-3">
            <h3 className="text-white font-semibold text-sm mb-5 flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-brand-400 to-brand-500 rounded-full" />
              Services
            </h3>
            <ul className="space-y-2.5">
              {services.map((service) => (
                <li key={service.label}>
                    {/* Not prefetched. Next prefetches every Link as it
                        enters the viewport, and this footer carries 23 of them
                        — scrolling to the bottom of any page fired 37 RSC
                        prefetch requests totalling 338KB, measured on /about.
                        On a phone those round-trips compete with the page the
                        visitor is actually reading, for destinations almost
                        nobody navigates to from a footer. The nav links and the
                        CTA below still prefetch: few, and high intent. */}
                  <Link
                    href={service.href}
                    prefetch={false}
                    className="text-sm text-ink-400 hover:text-brand-500 transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </StaggerItem>

          {/* Company */}
          <StaggerItem choreography="rise" className="lg:col-span-2">
            <h3 className="text-white font-semibold text-sm mb-5 flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-brand-400 to-brand-500 rounded-full" />
              Company
            </h3>
            <ul className="space-y-2.5">
              {company.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    prefetch={false}
                    className="text-sm text-ink-400 hover:text-brand-500 transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </StaggerItem>

          {/* CTA card */}
          <StaggerItem choreography="scale" className="lg:col-span-3">
            <div className="bg-gradient-to-br from-brand-500/20 to-brand-700/10 border border-brand-500/20 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-500 flex items-center justify-center mb-4">
                {/* `text-on-brand`, not `text-white`: this tile is a brand
                    fill, and on this panel the brand fill is gold. White on
                    #fcc623 is 1.6:1 — the icon would all but vanish. The token
                    tracks the fill (white on red, near-black on gold). */}
                <GraduationCap className="w-5 h-5 text-on-brand" />
              </div>
              <h3 className="text-white font-bold text-base font-display mb-2">
                Ready to achieve academic excellence?
              </h3>
              <p className="text-ink-400 text-xs mb-4 leading-relaxed">
                Book a free 15-minute consultation with our experts and get started today.
              </p>
              <Link
                href="/book"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-brand-400 to-brand-500 text-on-brand text-sm font-semibold rounded-xl hover:shadow-[0_4px_16px_rgba(99,3,3,0.3)] transition-all"
              >
                Book Free Consultation
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { icon: BookOpen, label: "100% Original" },
                { icon: Globe, label: "Worldwide Service" },
                { icon: FileText, label: "Confidential" },
                { icon: Award, label: "Expert Team" },
              ].map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-2 bg-white/5 rounded-lg px-2.5 py-2"
                >
                  <badge.icon className="w-3.5 h-3.5 text-brand-500" />
                  <span className="text-[10px] text-ink-600 font-medium">{badge.label}</span>
                </div>
              ))}
            </div>
          </StaggerItem>
        </Stagger>
      </div>

      {/* Bottom bar */}
      <div className="accent-gold-fixed border-t border-white/8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-ink-600 text-xs text-center sm:text-left">
              © {new Date().getFullYear()} Altivance Academic Consultancy. All rights reserved.
              <span className="mx-2">·</span>
              <span className="text-brand-500">Where Academic Excellence Meets Results</span>
            </p>
            <div className="flex items-center gap-4">
              {legal.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  prefetch={false}
                  className="text-ink-600 hover:text-ink-400 text-xs transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
