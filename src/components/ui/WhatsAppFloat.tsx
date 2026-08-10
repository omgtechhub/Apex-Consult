"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { duration, ease, spring, stagger } from "@/lib/motion";

const quickTopics = ["Project Writing", "Study Abroad", "Data Analysis", "Proofreading"];

export function WhatsAppFloat() {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const prefersReduced = useReducedMotion() ?? false;

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Escape closes the panel — it is a dismissible overlay, so it owes the user
  // a keyboard exit.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat popup.
          Origin is bottom-right so the panel grows out of the button it came
          from rather than materialising over it. The previous version applied
          an `animate-scaleIn` class that was never defined — only the
          @keyframes existed — so this panel appeared with no transition at all. */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="bg-surface rounded-2xl shadow-layered border border-ink-200/60 w-72 overflow-hidden origin-bottom-right"
            role="dialog"
            aria-label="WhatsApp quick chat"
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{
              opacity: 0,
              scale: 0.9,
              y: 8,
              transition: { duration: duration.fast, ease: ease.exit },
            }}
            transition={prefersReduced ? { duration: 0 } : spring.gentle}
          >
            {/* Header */}
            <div className="bg-[#25D366] px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <div>
                <div className="text-white font-bold text-sm">Apex Academic</div>
                <div className="flex items-center gap-1">
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-surface"
                    animate={prefersReduced ? undefined : { opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: ease.soft }}
                  />
                  <span className="text-white/80 text-[10px]">Online now</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="ml-auto text-white/80 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message — bubbles land after the panel, the way a message would
                actually arrive. */}
            <div className="p-4">
              <motion.div
                className="bg-[#dcf8c6] rounded-xl rounded-tl-none p-3 mb-3 max-w-[85%]"
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: prefersReduced ? 0 : 0.15,
                  duration: duration.base,
                  ease: ease.entrance,
                }}
              >
                <p className="text-sm text-ink-950 leading-relaxed">
                  👋 Hello! Welcome to Apex Academic Consultancy.
                </p>
                <p className="text-sm text-ink-950 leading-relaxed mt-1">
                  How can we help you today?
                </p>
              </motion.div>

              <motion.div
                className="flex gap-2 flex-wrap"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: prefersReduced ? 0 : stagger.tight,
                      delayChildren: prefersReduced ? 0 : 0.25,
                    },
                  },
                }}
              >
                {quickTopics.map((quick) => (
                  <motion.a
                    key={quick}
                    href={`https://wa.me/2347084321204?text=Hello!%20I%20need%20help%20with%20${encodeURIComponent(quick)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-2.5 py-1 border border-[#25D366]/40 text-[#25D366] rounded-full hover:bg-[#25D366]/10 transition-colors"
                    variants={{
                      hidden: { opacity: 0, scale: 0.85 },
                      visible: { opacity: 1, scale: 1 },
                    }}
                    whileHover={prefersReduced ? undefined : { scale: 1.06 }}
                    whileTap={prefersReduced ? undefined : { scale: 0.95 }}
                    transition={spring.snappy}
                  >
                    {quick}
                  </motion.a>
                ))}
              </motion.div>
            </div>

            {/* Input */}
            <div className="px-4 pb-4">
              <motion.a
                href="https://wa.me/2347084321204?text=Hello%20Apex%20Academic%20Consultancy!%20I%20need%20academic%20help."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white text-sm font-semibold rounded-xl hover:bg-[#20ba5a] transition-colors"
                whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                transition={spring.snappy}
              >
                <WhatsAppIcon className="w-4 h-4" />
                Start Chat on WhatsApp
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button.
          Mounted from the first render and animated in on a delay, rather than
          returning `null` for three seconds and then appearing instantly. */}
      <AnimatePresence>
        {visible && (
          <motion.button
            onClick={() => setIsOpen((o) => !o)}
            className={`relative w-14 h-14 rounded-full shadow-[0_8px_32px_rgba(37,211,102,0.4)] flex items-center justify-center transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366] ${
              isOpen ? "bg-ink-600" : "bg-[#25D366]"
            }`}
            aria-label={isOpen ? "Close WhatsApp chat" : "Open WhatsApp chat"}
            aria-expanded={isOpen}
            initial={{ opacity: 0, scale: 0.4, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={prefersReduced ? { duration: 0 } : spring.bouncy}
            whileHover={prefersReduced ? undefined : { scale: 1.09 }}
            whileTap={prefersReduced ? undefined : { scale: 0.93 }}
          >
            {/* Attention ping. Stops once the panel has been opened — a pulse
                that never resolves is just noise. */}
            {!isOpen && !prefersReduced && (
              <motion.span
                className="absolute inset-0 rounded-full bg-[#25D366]"
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: ease.entrance }}
              />
            )}
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isOpen ? "close" : "chat"}
                className="relative"
                initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
                transition={{ duration: duration.fast, ease: ease.entrance }}
              >
                {isOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <WhatsAppIcon className="w-6 h-6 text-white" />
                )}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
