"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { useSmoothScroll } from "@/components/motion/SmoothScrollProvider";
import { Tactile } from "@/components/motion/Tactile";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { duration, ease, spring, stagger } from "@/lib/motion";
import {
  Menu,
  X,
  ChevronDown,
  GraduationCap,
  BookOpen,
  FileText,
  Globe,
  Users,
  BarChart3,
  Award,
  Briefcase,
  Phone,
  ArrowRight,
} from "lucide-react";

const services = [
  {
    name: "Project Writing",
    desc: "Complete academic projects from scratch",
    icon: FileText,
    href: "/services/project-writing",
  },
  {
    name: "Research Assistance",
    desc: "Expert guidance for your research",
    icon: BookOpen,
    href: "/services/research-assistance",
  },
  {
    name: "Data Analysis",
    desc: "SPSS, R, and statistical analysis",
    icon: BarChart3,
    href: "/services/data-analysis",
  },
  {
    name: "Study Abroad",
    desc: "International university applications",
    icon: Globe,
    href: "/study-abroad",
  },
  {
    name: "CV & SOP Writing",
    desc: "Professional documents that win",
    icon: Award,
    href: "/services/cv-sop",
  },
  {
    name: "Admission Guidance",
    desc: "Navigate university applications",
    icon: GraduationCap,
    href: "/services/admission",
  },
  {
    name: "Business Proposals",
    desc: "Compelling proposals that close deals",
    icon: Briefcase,
    href: "/services/business-proposals",
  },
  {
    name: "Consultation",
    desc: "1-on-1 expert academic sessions",
    icon: Users,
    href: "/book",
  },
];

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services", hasDropdown: true },
  { label: "Study Abroad", href: "/study-abroad" },
  { label: "Scholarships", href: "/scholarships" },
  { label: "Resources", href: "/resources" },
  { label: "Blog", href: "/blog" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const pathname = usePathname();
  const prefersReduced = useReducedMotion() ?? false;
  const { velocity, stop, start } = useSmoothScroll();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastY = useRef(0);

  /**
   * Auto-hiding header, driven by Lenis's velocity MotionValue rather than a
   * scroll listener. `useMotionValueEvent` runs inside the existing rAF loop,
   * so this costs no additional listener and no extra layout read — and state
   * is only touched on an actual threshold crossing, not on every frame.
   */
  useMotionValueEvent(velocity, "change", (v) => {
    const y = window.scrollY;
    setScrolled(y > 24);

    // Never hide near the top, and require real intent (not a 1px jitter).
    if (y < 120) {
      setHidden(false);
    } else if (v > 3 && y > lastY.current) {
      setHidden(true);
    } else if (v < -3) {
      setHidden(false);
    }
    lastY.current = y;
  });

  // Reduced-motion users get no Lenis instance, so velocity never ticks —
  // fall back to a passive scroll listener for the `scrolled` background.
  useEffect(() => {
    if (!prefersReduced) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [prefersReduced]);

  /**
   * Close every menu when the route changes.
   *
   * Adjusted during render rather than in an effect. React re-runs this
   * component immediately with the new state and *before* painting, so the
   * menus never flash open on the new page — an effect would close them one
   * frame late. This is React's documented pattern for deriving state from a
   * changing prop, and it avoids the cascading render a setState-in-effect
   * causes on every single navigation.
   */
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setIsOpen(false);
    setServicesOpen(false);
    setMobileServicesOpen(false);
  }

  /**
   * The mobile drawer must stop Lenis, not just set `overflow: hidden`.
   * Lenis drives scroll through a rAF loop on a transform, which `overflow`
   * cannot reach — the body would keep scrolling behind the open drawer.
   */
  useEffect(() => {
    if (isOpen) {
      stop();
      document.body.style.overflow = "hidden";
    } else {
      start();
      document.body.style.overflow = "";
    }
    return () => {
      start();
      document.body.style.overflow = "";
    };
  }, [isOpen, stop, start]);

  // Escape closes whichever layer is on top.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (servicesOpen) {
        setServicesOpen(false);
        triggerRef.current?.focus();
      } else if (isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [servicesOpen, isOpen]);

  // Click-away for the mega menu, which hover alone can't cover once it has
  // been opened by keyboard or touch.
  useEffect(() => {
    if (!servicesOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        !dropdownRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setServicesOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [servicesOpen]);

  const openMenu = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setServicesOpen(true);
  }, []);

  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    // Grace period so the pointer can cross the gap between trigger and panel.
    closeTimer.current = setTimeout(() => setServicesOpen(false), 180);
  }, []);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    []
  );

  return (
    <>
      <motion.header
        /*
          The bar is opaque at all times, on every route.

          It used to be transparent at the top of the page and switch to a
          frosted `.glass` panel once scrolled. Both states let page content
          show through — over the hero photograph and over scrolling cards the
          logo and links were competing with whatever happened to be behind
          them, which is exactly when navigation most needs to be readable.

          Solid `bg-canvas` costs the reveal effect and buys a header that never
          changes legibility. The shadow still appears on scroll, so the bar
          still reads as lifting off the page.
        */
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-canvas transition-[border-color,box-shadow] duration-300",
          scrolled
            ? "border-b border-ink-200/60 shadow-sm"
            : "border-b border-ink-200/40"
        )}
        role="banner"
        // Slides away on downward scroll to hand the full viewport back to the
        // content, and returns the instant the user scrolls up — the moment
        // they are most likely to be looking for navigation.
        animate={{ y: hidden && !isOpen && !servicesOpen ? "-100%" : "0%" }}
        transition={prefersReduced ? { duration: 0 } : spring.gentle}
      >
        <nav
          className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8"
          aria-label="Main navigation"
        >
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label="Altivance Academic Consultancy - Home"
            >
              <motion.div
                className="relative w-9 h-9 flex items-center justify-center"
                whileHover={prefersReduced ? undefined : { scale: 1.08, rotate: -5 }}
                whileTap={prefersReduced ? undefined : { scale: 0.94 }}
                transition={spring.bouncy}
              >
                {/* `priority` because this is above the fold on every route —
                    without it the header renders logo-less on first paint. */}
                <Image
                  src="/logo.png"
                  alt=""
                  width={36}
                  height={36}
                  priority
                  className="w-9 h-9 object-contain"
                />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-ink-950 font-bold text-sm leading-tight font-display tracking-tight">
                  ALTIVANCE ACADEMIC
                </span>
                <span className="text-brand-500 text-[10px] font-semibold tracking-[0.15em] uppercase leading-tight font-body">
                  Consultancy
                </span>
              </div>
            </Link>

            {/* Desktop Nav.
                A single `layoutId` pill follows the hovered item instead of
                each link fading its own background — the highlight travels
                between items, which reads as one indicator rather than seven. */}
            <div
              className="hidden lg:flex items-center gap-1"
              onMouseLeave={() => setHoveredLink(null)}
            >
              {navLinks.map((link) => {
                const isActive =
                  link.hasDropdown
                    ? pathname.startsWith("/services")
                    : pathname === link.href;

                if (link.hasDropdown) {
                  return (
                    <div
                      key={link.label}
                      className="relative"
                      onMouseEnter={() => {
                        openMenu();
                        setHoveredLink(link.label);
                      }}
                      onMouseLeave={scheduleClose}
                    >
                      <button
                        ref={triggerRef}
                        // Click/Enter/Space toggles it. Previously this button
                        // opened on hover only, which left the entire services
                        // menu unreachable by keyboard and on touch.
                        onClick={() => setServicesOpen((o) => !o)}
                        onFocus={openMenu}
                        className={cn(
                          "relative flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                          isActive ? "text-brand-500" : "text-ink-700 hover:text-ink-950"
                        )}
                        aria-expanded={servicesOpen}
                        aria-haspopup="true"
                        aria-controls="services-mega-menu"
                      >
                        {hoveredLink === link.label && (
                          <motion.span
                            layoutId="nav-hover-pill"
                            className="absolute inset-0 rounded-lg bg-ink-100"
                            transition={spring.snappy}
                          />
                        )}
                        <span className="relative z-10">{link.label}</span>
                        <motion.span
                          className="relative z-10"
                          animate={{ rotate: servicesOpen ? 180 : 0 }}
                          transition={prefersReduced ? { duration: 0 } : spring.snappy}
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </motion.span>
                      </button>

                      {/* Mega Dropdown */}
                      <AnimatePresence>
                        {servicesOpen && (
                          <motion.div
                            id="services-mega-menu"
                            ref={dropdownRef}
                            className="absolute top-full left-1/2 mt-2 w-[640px] bg-surface rounded-2xl shadow-layered border border-ink-200/60 overflow-hidden origin-top"
                            initial={{ opacity: 0, y: -8, scale: 0.97, x: "-50%" }}
                            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
                            exit={{
                              opacity: 0,
                              y: -6,
                              scale: 0.98,
                              x: "-50%",
                              transition: { duration: duration.fast, ease: ease.exit },
                            }}
                            transition={prefersReduced ? { duration: 0 } : spring.gentle}
                            onMouseEnter={openMenu}
                            onMouseLeave={scheduleClose}
                          >
                            <div className="p-6">
                              <motion.div
                                className="grid grid-cols-2 gap-2"
                                initial="hidden"
                                animate="visible"
                                variants={{
                                  hidden: {},
                                  visible: {
                                    transition: {
                                      staggerChildren: prefersReduced ? 0 : 0.025,
                                    },
                                  },
                                }}
                              >
                                {services.map((service) => (
                                  <motion.div
                                    key={service.name}
                                    variants={{
                                      hidden: { opacity: 0, y: 8 },
                                      visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                          duration: duration.base,
                                          ease: ease.entrance,
                                        },
                                      },
                                    }}
                                  >
                                      {/* Not prefetched: ten service pages,
                                          behind a hover dropdown. Prefetching
                                          all of them on every page load cost
                                          far more than it ever saved. */}
                                    <Link
                                      href={service.href}
                                      prefetch={false}
                                      className="flex items-start gap-3 p-3 rounded-xl transition-colors duration-200 hover:bg-canvas group/item focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                                    >
                                      <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover/item:bg-gradient-to-br group-hover/item:from-brand-400 group-hover/item:to-brand-500">
                                        <service.icon className="w-4.5 h-4.5 text-brand-500 transition-colors duration-200 group-hover/item:text-white" />
                                      </div>
                                      <div>
                                        <div className="text-sm font-semibold text-ink-950 transition-colors group-hover/item:text-brand-500">
                                          {service.name}
                                        </div>
                                        <div className="text-xs text-ink-500 mt-0.5">
                                          {service.desc}
                                        </div>
                                      </div>
                                    </Link>
                                  </motion.div>
                                ))}
                              </motion.div>
                              <div className="mt-4 pt-4 border-t border-ink-200/60 flex items-center justify-between">
                                <span className="text-xs text-ink-500">
                                  View all 20+ services
                                </span>
                                <Link
                                  href="/services"
                                  prefetch={false}
                                  className="group/all text-xs font-semibold text-brand-500 hover:text-brand-700 flex items-center gap-1 transition-colors"
                                >
                                  See all services
                                  <ArrowRight className="w-3 h-3 transition-transform duration-300 ease-[var(--ease-entrance)] group-hover/all:translate-x-0.5" />
                                </Link>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    /*
                     * Not prefetched on sight.
                     *
                     * These nine links were responsible for 37 RSC prefetch
                     * requests and 338KB on a single page view — each URL
                     * fetched three to five times, in a 500ms burst during
                     * hydration, because the header re-renders and Next
                     * re-registers each Link when it does. That is 338KB of
                     * contention with the page the visitor is actually
                     * reading, and on a phone it is the difference between
                     * "quick" and "chronically sluggish".
                     *
                     * Next still prefetches on hover, so a desktop visitor
                     * who is about to click still gets the fast navigation.
                     * A phone has no hover and so was paying the entire cost
                     * for none of the benefit.
                     */
                    prefetch={false}
                    onMouseEnter={() => setHoveredLink(link.label)}
                    className={cn(
                      "relative px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                      isActive ? "text-brand-500" : "text-ink-700 hover:text-ink-950"
                    )}
                  >
                    {hoveredLink === link.label && (
                      <motion.span
                        layoutId="nav-hover-pill"
                        className="absolute inset-0 rounded-lg bg-ink-100"
                        transition={spring.snappy}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                    {/* Persistent underline for the current route — hover state
                        and location state must stay visually distinct. */}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-underline"
                        className="absolute left-3.5 right-3.5 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-brand-400 to-brand-500"
                        transition={spring.snappy}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <a
                href="https://wa.me/2347084321204"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 text-sm font-medium text-ink-700 hover:text-ink-950 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-12" />
                <span>WhatsApp</span>
              </a>
              <Tactile
                href="/book"
                lift={1}
                className="px-4 py-2.5 bg-gradient-to-r from-brand-400 to-brand-500 text-on-brand text-sm font-semibold rounded-lg overflow-hidden transition-shadow duration-200 hover:shadow-[0_4px_16px_rgba(99,3,3,0.35)]"
              >
                Book Consultation
              </Tactile>
              <ThemeToggle />
            </div>

            {/* Mobile: theme toggle sits outside the drawer so it is reachable
                without opening the menu — changing theme is a display
                preference, not a navigation task. */}
            <div className="flex items-center gap-1 lg:hidden">
              <ThemeToggle />

            {/* Mobile Menu Toggle */}
            <motion.button
              onClick={() => setIsOpen((o) => !o)}
              className="p-2.5 rounded-xl hover:bg-ink-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              whileTap={prefersReduced ? undefined : { scale: 0.9 }}
              transition={spring.snappy}
            >
              {/* Cross-fade + rotate between the two glyphs so the control
                  morphs rather than blinking from one icon to the other. */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isOpen ? "close" : "open"}
                  className="block"
                  initial={{ opacity: 0, rotate: isOpen ? -90 : 90, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: isOpen ? 90 : -90, scale: 0.7 }}
                  transition={{ duration: duration.fast, ease: ease.entrance }}
                >
                  {isOpen ? (
                    <X className="w-5 h-5 text-ink-950" />
                  ) : (
                    <Menu className="w-5 h-5 text-ink-950" />
                  )}
                </motion.span>
              </AnimatePresence>
            </motion.button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-40 lg:hidden" id="mobile-menu">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-surface-dark/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: duration.base }}
            />

            {/* Drawer */}
            <motion.div
              className="absolute top-0 right-0 h-full w-[320px] bg-canvas shadow-2xl overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              data-lenis-prevent
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%", transition: { duration: duration.base, ease: ease.exit } }}
              transition={prefersReduced ? { duration: 0 } : spring.gentle}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <Link
                    href="/"
                    className="flex items-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <Image
                      src="/logo.png"
                      alt=""
                      width={32}
                      height={32}
                      className="w-8 h-8 object-contain"
                    />
                    <span className="font-bold text-sm text-ink-950 font-display">
                      ALTIVANCE ACADEMIC
                    </span>
                  </Link>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-ink-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    aria-label="Close menu"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Nav Links — cascade in behind the drawer's own slide, so the
                    panel arrives first and its contents settle after it. */}
                <motion.nav
                  className="space-y-1"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: prefersReduced ? 0 : stagger.tight,
                        delayChildren: prefersReduced ? 0 : 0.12,
                      },
                    },
                  }}
                >
                  {navLinks.map((link) => {
                    const itemVariants = {
                      hidden: { opacity: 0, x: 24 },
                      visible: {
                        opacity: 1,
                        x: 0,
                        transition: { duration: duration.base, ease: ease.entrance },
                      },
                    };

                    if (link.hasDropdown) {
                      return (
                        <motion.div key={link.label} variants={itemVariants}>
                          <button
                            onClick={() => setMobileServicesOpen((o) => !o)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-ink-700 hover:bg-ink-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                            aria-expanded={mobileServicesOpen}
                            aria-controls="mobile-services-panel"
                          >
                            {link.label}
                            <motion.span
                              animate={{ rotate: mobileServicesOpen ? 180 : 0 }}
                              transition={prefersReduced ? { duration: 0 } : spring.snappy}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </motion.span>
                          </button>

                          <AnimatePresence initial={false}>
                            {mobileServicesOpen && (
                              <motion.div
                                id="mobile-services-panel"
                                className="overflow-hidden"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{
                                  duration: prefersReduced ? 0 : duration.base,
                                  ease: ease.emphasized,
                                }}
                              >
                                <div className="mt-1 ml-3 space-y-1">
                                  {services.map((s) => (
                                    <Link
                                      key={s.name}
                                      href={s.href}
                                      prefetch={false}
                                      onClick={() => setIsOpen(false)}
                                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-ink-600 hover:text-brand-500 hover:bg-brand-100/50 transition-colors"
                                    >
                                      <s.icon className="w-3.5 h-3.5" />
                                      {s.name}
                                    </Link>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    }

                    return (
                      <motion.div key={link.label} variants={itemVariants}>
                        <Link
                          href={link.href}
                          prefetch={false}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            pathname === link.href
                              ? "text-brand-500 bg-brand-100/50"
                              : "text-ink-700 hover:bg-ink-100"
                          )}
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.nav>

                {/* Mobile CTA */}
                <motion.div
                  className="mt-8 space-y-3"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: prefersReduced ? 0 : 0.3,
                    duration: duration.base,
                    ease: ease.entrance,
                  }}
                >
                  <Tactile
                    href="/book"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-brand-400 to-brand-500 text-on-brand text-sm font-semibold rounded-xl shadow-lg overflow-hidden"
                  >
                    Book Consultation
                    <ArrowRight className="w-4 h-4" />
                  </Tactile>
                  <Tactile
                    href="https://wa.me/2347084321204"
                    external
                    rippleColor="rgba(99,3,3,0.16)"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-ink-200 text-ink-700 text-sm font-medium rounded-xl overflow-hidden transition-colors hover:bg-ink-100"
                  >
                    <Phone className="w-4 h-4" />
                    Chat on WhatsApp
                  </Tactile>
                </motion.div>

                {/* Contact info */}
                <div className="mt-8 pt-6 border-t border-ink-200/60">
                  <p className="text-xs text-ink-500 mb-1">WhatsApp / Call</p>
                  <a href="tel:+2347084321204" className="text-sm font-semibold text-ink-950">
                    +234 708 432 1204
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
