"use client";

/**
 * Staff sign-in form.
 *
 * Client component purely so the submit button can show pending state via
 * `useFormStatus` — the credential check itself is a server action and no
 * password ever touches client state.
 */

import { useFormStatus } from "react-dom";
import { motion } from "framer-motion";
import { Loader2, LogIn, ShieldAlert } from "lucide-react";
import Image from "next/image";
import { duration, ease } from "@/lib/motion";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-5 py-3 text-sm font-semibold text-white shadow-layered-gold transition-opacity disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4" /> Sign in
        </>
      )}
    </button>
  );
}

export function LoginForm({
  action,
  hasError,
  next,
}: {
  action: (formData: FormData) => void;
  hasError: boolean;
  next?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: duration.slow, ease: ease.entrance }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <Image src="/logo.png" alt="" width={48} height={48} className="mb-4 h-12 w-12 object-contain" />
          <h1 className="font-display text-2xl font-black text-ink-950">Staff sign in</h1>
          <p className="mt-1 text-sm text-ink-500">Apex Academic Consultancy</p>
        </div>

        <form
          action={action}
          className="rounded-2xl border border-ink-200/60 bg-surface p-6 shadow-layered"
        >
          {next ? <input type="hidden" name="next" value={next} /> : null}

          {hasError && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Those details didn&apos;t match an active staff account.</span>
            </div>
          )}

          <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-ink-600">
            Work email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            autoFocus
            className="mb-4 w-full rounded-xl border border-ink-200 bg-surface px-4 py-3 text-sm text-ink-950 placeholder:text-ink-400 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30"
            placeholder="you@apexacademic.com"
          />

          <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-ink-600">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-xl border border-ink-200 bg-surface px-4 py-3 text-sm text-ink-950 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30"
          />

          <SubmitButton />
        </form>

        <p className="mt-6 text-center text-xs text-ink-500">
          Accounts are created by an administrator.
        </p>
      </motion.div>
    </div>
  );
}
