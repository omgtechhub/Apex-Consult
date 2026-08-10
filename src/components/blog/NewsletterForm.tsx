"use client";

/**
 * NewsletterForm
 * --------------
 * Subscribe box for the blog index.
 *
 * This was a plain `<form action="/api/newsletter" method="POST">`. That route
 * answers with JSON, so submitting it navigated the browser away from the blog
 * and left the reader looking at `{"success":true}` on a white page, with no
 * way back except the back button. The endpoint is unchanged — it already
 * accepts JSON — but the request now goes out over `fetch` so the result can be
 * reported in place.
 *
 * Non-2xx responses are treated as failures. That sounds obvious, but it's the
 * exact bug the other two forms had: `fetch` only rejects on network errors, so
 * a 500 resolves normally and an unchecked `.ok` reports success on a request
 * that saved nothing.
 */

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Loader2, Send } from "lucide-react";
import { SubmitError, SubmitLabel, SuccessCheck } from "@/components/motion/FormMotion";
import { duration, ease } from "@/lib/motion";

type Status = "idle" | "pending" | "success" | "error";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const prefersReduced = useReducedMotion() ?? false;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "pending") return;

    setStatus("pending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // A resolved promise is not a successful request.
      if (!res.ok) throw new Error(`Subscribe failed with ${res.status}`);

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mt-16 bg-gradient-to-r from-gold-100 to-gold-200/50 border border-gold-200/60 rounded-3xl p-8 lg:p-10 text-center">
      <AnimatePresence mode="wait" initial={false}>
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: prefersReduced ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReduced ? 0 : duration.slow, ease: ease.entrance }}
          >
            <SuccessCheck />
            <h2 className="text-2xl font-black font-display text-ink-950 mt-5 mb-2">
              You&apos;re subscribed.
            </h2>
            <p className="text-ink-600 text-sm">
              Look out for your first issue — academic insights, every week.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={false}
            exit={{ opacity: 0, y: prefersReduced ? 0 : -12 }}
            transition={{ duration: prefersReduced ? 0 : duration.base, ease: ease.exit }}
          >
            <h2 className="text-2xl font-black font-display text-ink-950 mb-2">
              Get academic insights in your inbox
            </h2>
            <p className="text-ink-600 text-sm mb-6">
              Join 5,000+ students receiving weekly tips on academic writing, scholarships, and study abroad.
            </p>

            <form
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              onSubmit={handleSubmit}
              noValidate
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Your email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="Your email address"
                required
                autoComplete="email"
                className="flex-1 px-4 py-3 bg-surface border border-ink-200 rounded-xl text-sm text-ink-950 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500/50 transition-all duration-200 ease-standard"
              />
              <motion.button
                type="submit"
                disabled={status === "pending"}
                whileHover={prefersReduced || status === "pending" ? undefined : { scale: 1.02, y: -1 }}
                whileTap={prefersReduced || status === "pending" ? undefined : { scale: 0.975 }}
                className="px-5 py-3 min-w-[9.5rem] bg-gradient-to-r from-gold-400 to-gold-500 text-white font-semibold text-sm rounded-xl shadow-layered-gold whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2"
              >
                <SubmitLabel
                  pending={status === "pending"}
                  idle={
                    <>
                      Subscribe Free
                      <Send className="w-3.5 h-3.5" />
                    </>
                  }
                  busy={
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Subscribing
                    </>
                  }
                />
              </motion.button>
            </form>

            <div className="max-w-md mx-auto mt-3 text-left">
              <SubmitError show={status === "error"}>
                <span>
                  Couldn&apos;t subscribe you just now. Please try again, or message us
                  on WhatsApp and we&apos;ll add you manually.
                </span>
              </SubmitError>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
