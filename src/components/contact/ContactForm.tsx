"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FieldError,
  SubmitError,
  SubmitLabel,
  SuccessCheck,
} from "@/components/motion/FormMotion";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { duration, ease, spring, stagger } from "@/lib/motion";

/** Shared input styling — kept in one place so every field animates alike. */
const fieldBase =
  "w-full px-4 py-3 bg-canvas border rounded-xl text-sm text-ink-950 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/50 transition-[border-color,box-shadow,background-color] duration-200";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  service: z.string().optional(),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const services = [
  "Project Writing",
  "Project Editing & Proofreading",
  "Research Assistance",
  "Data Analysis",
  "Study Abroad",
  "Admission Guidance",
  "Scholarship Guidance",
  "CV & SOP Writing",
  "Business Proposal",
  "Other",
];

export function ContactForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);
  const prefersReduced = useReducedMotion() ?? false;

  const { register, handleSubmit, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitFailed(false);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      // A non-2xx response is a failure too — the previous version only caught
      // network errors, so a 500 silently looked identical to success.
      if (res.ok) setIsSuccess(true);
      else setSubmitFailed(true);
    } catch {
      setSubmitFailed(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        className="bg-surface border border-ink-200/60 rounded-3xl p-10 text-center"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={prefersReduced ? { duration: 0 } : spring.gentle}
      >
        <SuccessCheck className="mb-5" />
        <motion.h2
          className="text-xl font-black font-display text-ink-950 mb-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReduced ? 0 : 0.25, duration: duration.base, ease: ease.entrance }}
        >
          Message Sent! ✓
        </motion.h2>
        <motion.p
          className="text-ink-600 text-sm leading-relaxed mb-6 text-pretty"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReduced ? 0 : 0.33, duration: duration.base, ease: ease.entrance }}
        >
          Thank you for reaching out! We&apos;ll get back to you within 2 hours.
          For faster response, WhatsApp us at +234 708 432 1204.
        </motion.p>
        <motion.a
          href="https://wa.me/2347084321204"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-semibold text-sm rounded-xl"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReduced ? 0 : 0.41, duration: duration.base, ease: ease.entrance }}
          whileHover={prefersReduced ? undefined : { scale: 1.03, y: -2 }}
          whileTap={prefersReduced ? undefined : { scale: 0.97 }}
        >
          Continue on WhatsApp
        </motion.a>
      </motion.div>
    );
  }

  return (
    <div className="bg-surface border border-ink-200/60 rounded-3xl p-8 lg:p-10 shadow-sm">
      <h2 className="text-xl font-bold font-display text-ink-950 mb-1">
        Send us a message
      </h2>
      <p className="text-sm text-ink-500 mb-8">
        Fill out the form and we&apos;ll get back to you within 2 hours.
      </p>

      {/* Fields cascade in on a tight rhythm — enough to feel composed, short
          enough that the first field is focusable almost immediately. */}
      <Stagger each={stagger.tight} as="div">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <SubmitError show={submitFailed}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              We couldn&apos;t send your message. Please try again, or reach us
              directly on WhatsApp at +234 708 432 1204.
            </span>
          </SubmitError>

          <StaggerItem choreography="rise" className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="contact-name"
                className="block text-xs font-semibold text-ink-700 mb-1.5"
              >
                Full Name *
              </label>
              <input
                id="contact-name"
                {...register("name")}
                aria-invalid={!!errors.name}
                className={cn(
                  fieldBase,
                  errors.name ? "border-red-300" : "border-ink-200"
                )}
                placeholder="Your full name"
              />
              <FieldError message={errors.name?.message} />
            </div>

            <div>
              <label
                htmlFor="contact-email"
                className="block text-xs font-semibold text-ink-700 mb-1.5"
              >
                Email *
              </label>
              <input
                id="contact-email"
                {...register("email")}
                type="email"
                aria-invalid={!!errors.email}
                className={cn(
                  fieldBase,
                  errors.email ? "border-red-300" : "border-ink-200"
                )}
                placeholder="your@email.com"
              />
              <FieldError message={errors.email?.message} />
            </div>
          </StaggerItem>

          <StaggerItem choreography="rise" className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="contact-phone"
                className="block text-xs font-semibold text-ink-700 mb-1.5"
              >
                Phone / WhatsApp
              </label>
              <input
                id="contact-phone"
                {...register("phone")}
                type="tel"
                className={cn(fieldBase, "border-ink-200")}
                placeholder="+234 xxx xxx xxxx"
              />
            </div>

            <div>
              <label
                htmlFor="contact-service"
                className="block text-xs font-semibold text-ink-700 mb-1.5"
              >
                Service Interested In
              </label>
              <select
                id="contact-service"
                {...register("service")}
                className={cn(fieldBase, "border-ink-200")}
              >
                <option value="">Select a service</option>
                {services.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </StaggerItem>

          <StaggerItem choreography="rise">
            <label
              htmlFor="contact-message"
              className="block text-xs font-semibold text-ink-700 mb-1.5"
            >
              Message *
            </label>
            <textarea
              id="contact-message"
              {...register("message")}
              rows={5}
              aria-invalid={!!errors.message}
              className={cn(
                fieldBase,
                "resize-none",
                errors.message ? "border-red-300" : "border-ink-200"
              )}
              placeholder="Tell us about your academic needs, project details, deadlines, and any specific requirements..."
            />
            <FieldError message={errors.message?.message} />
          </StaggerItem>

          <StaggerItem choreography="rise">
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-brand-400 to-brand-500 text-on-brand font-semibold text-sm rounded-xl transition-shadow duration-200 hover:shadow-layered-brand disabled:opacity-60 disabled:cursor-not-allowed"
              whileHover={prefersReduced || isSubmitting ? undefined : { scale: 1.01, y: -1 }}
              whileTap={prefersReduced || isSubmitting ? undefined : { scale: 0.985 }}
              transition={spring.snappy}
            >
              <SubmitLabel
                pending={isSubmitting}
                busy={
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                  </>
                }
                idle={
                  <>
                    Send Message <ArrowRight className="w-4 h-4" />
                  </>
                }
              />
            </motion.button>

            <p className="text-center text-xs text-ink-400 mt-4">
              We typically respond within 2 hours during business hours.
            </p>
          </StaggerItem>
        </form>
      </Stagger>
    </div>
  );
}
