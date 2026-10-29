"use client";

/**
 * ThemeToggle
 * -----------
 * Switches between light and dark by toggling a `.dark` class on <html>.
 *
 * State lives in three places and they have to agree:
 *  1. `localStorage.theme` — the user's explicit choice, if they made one;
 *  2. `prefers-color-scheme` — the OS default, used until they choose;
 *  3. the `.dark` class — what the page is actually rendering.
 *
 * The inline script in `layout.tsx` reconciles (1) and (2) before first paint.
 * This component only has to keep (3) in step and record new choices.
 *
 * It renders a placeholder until mounted. The server cannot know the visitor's
 * theme, so rendering the "real" icon during SSR guarantees a hydration
 * mismatch and a visible icon flip on every load.
 */

import { useSyncExternalStore } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { duration, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

const THEME_EVENT = "apex:themechange";

/** Must outlast the 220ms colour transition in globals.css. */
const THEME_FADE_MS = 260;

/**
 * Module-scoped rather than a ref: the toggle is rendered in both the desktop
 * header and the mobile drawer, so two instances exist at once and they must
 * share one timer. A per-instance ref would let one instance's timeout clear
 * the class out from under the other's in-flight fade.
 */
let fadeTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * The source of truth is the `.dark` class on <html>, which the inline
 * bootstrap script sets before first paint. `useSyncExternalStore` reads it
 * directly rather than mirroring it into React state via an effect — mirroring
 * means the component renders once with the wrong value and then corrects
 * itself, which is both a cascading render and a visible icon flip.
 *
 * `getServerSnapshot` returns null so the server and the hydrating client agree
 * on "unknown", and the real value only appears once we are on the client.
 */
function subscribe(onChange: () => void) {
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const getSnapshot = (): Theme =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

const getServerSnapshot = (): Theme | null => null;

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const prefersReduced = useReducedMotion() ?? false;

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;

    // The colour crossfade lives behind `.theme-transition`, which exists only
    // for the duration of the switch. Keeping it on permanently would put a
    // live `transition` on every element in the document and make every style
    // recalculation markedly more expensive — see globals.css.
    //
    // A pending timer is cleared first so rapid double-toggles don't let an
    // earlier timeout strip the class while a later switch is still fading.
    if (fadeTimer !== null) clearTimeout(fadeTimer);
    root.classList.add("theme-transition");

    root.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode / storage disabled. The class still applies for this
      // session; only persistence is lost, which is not worth failing over.
    }
    window.dispatchEvent(new Event(THEME_EVENT));

    // Slightly longer than the 220ms transition so the fade always completes.
    fadeTimer = setTimeout(() => {
      root.classList.remove("theme-transition");
      fadeTimer = null;
    }, THEME_FADE_MS);
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      // Until mounted the control is inert and unlabelled-by-state, so screen
      // readers never announce a theme the page might not be in.
      aria-label={
        theme === null
          ? "Toggle colour theme"
          : `Switch to ${isDark ? "light" : "dark"} theme`
      }
      aria-pressed={theme === null ? undefined : isDark}
      className={cn(
        "relative grid h-9 w-9 place-items-center rounded-lg border border-ink-200 bg-surface text-ink-600",
        "transition-colors duration-200 ease-standard hover:text-gold-500 hover:border-gold-500/40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === null ? (
          // Neutral placeholder: same footprint, no state claim.
          <motion.span key="idle" className="h-4 w-4 rounded-full bg-ink-200" />
        ) : (
          <motion.span
            key={theme}
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, rotate: -90, scale: 0.6 }}
            animate={prefersReduced ? { opacity: 1 } : { opacity: 1, rotate: 0, scale: 1 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, rotate: 90, scale: 0.6 }}
            transition={prefersReduced ? { duration: duration.instant } : spring.snappy}
            className="grid place-items-center"
          >
            {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

