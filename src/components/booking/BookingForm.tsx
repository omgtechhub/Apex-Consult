"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Loader2, CheckCircle2, Calendar, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FieldError,
  SubmitError,
  SubmitLabel,
  SuccessCheck,
} from "@/components/motion/FormMotion";
import { duration, ease, spring, stagger } from "@/lib/motion";

/** Shared field styling, so every input in the wizard reacts identically. */
const fieldBase =
  "w-full px-4 py-3 bg-canvas border rounded-xl text-sm text-ink-950 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500/50 transition-[border-color,box-shadow] duration-200";

/**
 * Steps slide in the direction of travel — forward enters from the right, Back
 * from the left. Without the directional cue a multi-step form gives no sense
 * of moving through a sequence, so users lose track of where they are.
 */
const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
};

const bookingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  service: z.string().min(1, "Please select a service"),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  level: z.string().optional(),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const services = [
  "Project Writing",
  "Project Editing & Proofreading",
  "Research Assistance",
  "Data Analysis (SPSS/R)",
  "Study Abroad Consultancy",
  "Admission Guidance",
  "Scholarship Guidance",
  "CV & Statement of Purpose",
  "Business Proposal",
  "Journal Formatting",
  "Assignment Assistance",
  "General Academic Consultation",
  "Other",
];

const timeSlots = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
  "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM",
];

const levels = [
  "OND / HND",
  "BSc (Undergraduate)",
  "PGD",
  "MSc / MA / MBA",
  "PhD",
  "Professional / Corporate",
  "Other",
];

function getAvailableDates() {
  const dates = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0) {
      dates.push({
        value: date.toISOString().split("T")[0],
        label: date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        date: date.getDate(),
        month: date.toLocaleDateString("en-US", { month: "short" }),
      });
    }
  }
  return dates;
}

export function BookingForm() {
  // `direction` is tracked alongside `step` so the exit animation of the
  // outgoing step knows which way it is leaving.
  const [[step, direction], setStepState] = useState<[number, number]>([1, 1]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);
  const prefersReduced = useReducedMotion() ?? false;
  const availableDates = getAvailableDates();

  const goToStep = (next: number) =>
    setStepState(([current]) => [next, next > current ? 1 : -1]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const selectedDate = watch("date");
  const selectedTime = watch("time");
  const selectedService = watch("service");

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    setSubmitFailed(false);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      // A non-2xx response is a failure too. Previously only thrown network
      // errors were caught, so a 500 left the spinner stopping with no
      // confirmation and no explanation.
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
        className="bg-surface border border-ink-200/60 rounded-3xl p-10 lg:p-14 text-center"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={prefersReduced ? { duration: 0 } : spring.gentle}
      >
        <SuccessCheck className="w-20 h-20 mb-6" />

        <motion.h2
          className="text-2xl font-black font-display text-ink-950 mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReduced ? 0 : 0.28, duration: duration.base, ease: ease.entrance }}
        >
          Booking Confirmed! 🎉
        </motion.h2>
        <motion.p
          className="text-ink-600 mb-4 leading-relaxed text-pretty"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReduced ? 0 : 0.35, duration: duration.base, ease: ease.entrance }}
        >
          Thank you for booking with Apex Academic Consultancy. Our team will review your
          request and confirm your appointment within 2 hours.
        </motion.p>

        {/* The "what happens next" list ticks in one line at a time, which
            reads as a sequence of upcoming events rather than a wall of text. */}
        <motion.div
          className="bg-canvas border border-ink-200/60 rounded-2xl p-6 text-left mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReduced ? 0 : 0.42, duration: duration.base, ease: ease.entrance }}
        >
          <div className="text-xs font-semibold text-ink-500 mb-2">What happens next:</div>
          <motion.div
            className="space-y-2"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: prefersReduced ? 0 : stagger.base,
                  delayChildren: prefersReduced ? 0 : 0.5,
                },
              },
            }}
          >
            {[
              "You'll receive a confirmation email within 30 minutes",
              "Our specialist will review your service request",
              "We'll send you a WhatsApp confirmation with meeting details",
              "At the scheduled time, we'll connect via WhatsApp, Zoom, or call",
            ].map((item, i) => (
              <motion.div
                key={item}
                className="flex items-start gap-2"
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  visible: {
                    opacity: 1,
                    x: 0,
                    transition: { duration: duration.base, ease: ease.entrance },
                  },
                }}
              >
                <span className="w-5 h-5 rounded-full bg-gold-100 text-gold-500 text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-ink-700">{item}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReduced ? 0 : 0.85, duration: duration.base, ease: ease.entrance }}
        >
          <motion.a
            href="https://wa.me/2347084321204"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-[#25D366] text-white font-semibold text-sm rounded-xl"
            whileHover={prefersReduced ? undefined : { scale: 1.03, y: -2 }}
            whileTap={prefersReduced ? undefined : { scale: 0.97 }}
            transition={spring.snappy}
          >
            Chat on WhatsApp
          </motion.a>
          {/* next/link, not <a> — an anchor here forces a full document reload
              and discards the client router's cache and scroll state. */}
          <Link
            href="/"
            className="px-6 py-3 border border-ink-200 text-ink-700 font-semibold text-sm rounded-xl transition-colors hover:bg-ink-100"
          >
            Return Home
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="bg-surface border border-ink-200/60 rounded-3xl overflow-hidden shadow-sm">
      {/* Progress header */}
      <div className="bg-canvas border-b border-ink-200/60 px-8 py-5">
        <div className="flex items-center justify-between mb-3">
          {[
            { n: 1, label: "Your Details" },
            { n: 2, label: "Schedule" },
            { n: 3, label: "Service" },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <motion.div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300",
                  step >= s.n
                    ? "bg-gradient-to-br from-gold-400 to-gold-500 text-white"
                    : "bg-ink-100 text-ink-400"
                )}
                // A small pop as each step is reached marks progress without
                // needing the user to read the label.
                //
                // Tween, not spring: a spring solves between exactly two
                // values, so handing it the three-keyframe pop below throws
                // ("Only two keyframes currently supported with spring").
                animate={step === s.n ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={
                  prefersReduced
                    ? { duration: 0 }
                    : { duration: duration.slow, ease: ease.overshoot }
                }
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={step > s.n ? "done" : "number"}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: prefersReduced ? 0 : duration.fast }}
                  >
                    {step > s.n ? <CheckCircle2 className="w-4 h-4" /> : s.n}
                  </motion.span>
                </AnimatePresence>
              </motion.div>
              <span
                className={cn(
                  "text-xs font-medium hidden sm:block transition-colors duration-300",
                  step >= s.n ? "text-ink-950" : "text-ink-400"
                )}
              >
                {s.label}
              </span>
              {i < 2 && (
                <div className="hidden sm:block w-16 h-px mx-2 bg-ink-200 overflow-hidden">
                  <motion.div
                    className="h-full w-full origin-left bg-gold-500"
                    initial={false}
                    animate={{ scaleX: step > s.n ? 1 : 0 }}
                    transition={{
                      duration: prefersReduced ? 0 : duration.slow,
                      ease: ease.emphasized,
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        {/* scaleX rather than width: the bar is a transform, so advancing a step
            never triggers layout on the header. */}
        <div className="h-1 bg-ink-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full w-full origin-left rounded-full bg-gradient-to-r from-gold-400 to-gold-500"
            initial={false}
            animate={{ scaleX: step / 3 }}
            transition={prefersReduced ? { duration: 0 } : spring.smooth}
          />
        </div>
      </div>

      {/* `overflow-hidden` clips the sliding steps so a step entering from the
          right can't widen the card mid-transition. */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-8 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
        {/* Step 1: Personal details */}
        {step === 1 && (
          <motion.div
            key="step-1"
            custom={direction}
            variants={prefersReduced ? undefined : stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: duration.base, ease: ease.entrance }}
            className="space-y-5"
          >
            <div>
              <h2 className="text-xl font-bold font-display text-ink-950 mb-1">
                Tell us about yourself
              </h2>
              <p className="text-sm text-ink-500">
                We&apos;ll use this to confirm your appointment and send details.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  {...register("name")}
                  className={cn(
                    fieldBase,
                    errors.name ? "border-red-300" : "border-ink-200"
                  )}
                  placeholder="e.g. Adaeze Okonkwo"
                />
                <FieldError message={errors.name?.message} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                  Phone / WhatsApp *
                </label>
                <input
                  {...register("phone")}
                  type="tel"
                  className={cn(
                    fieldBase,
                    errors.phone ? "border-red-300" : "border-ink-200"
                  )}
                  placeholder="+234 xxx xxx xxxx"
                />
                <FieldError message={errors.phone?.message} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                Email Address *
              </label>
              <input
                {...register("email")}
                type="email"
                className={cn(
                  fieldBase,
                  errors.email ? "border-red-300" : "border-ink-200"
                )}
                placeholder="your@email.com"
              />
              <FieldError message={errors.email?.message} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                Academic Level
              </label>
              <select
                {...register("level")}
                className="w-full px-4 py-3 bg-canvas border border-ink-200 rounded-xl text-sm text-ink-950 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500/50 transition-all"
              >
                <option value="">Select your level</option>
                {levels.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => goToStep(2)}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-gold-400 to-gold-500 text-white font-semibold text-sm rounded-xl hover:shadow-lg hover:scale-[1.01] transition-all duration-200"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Step 2: Schedule */}
        {step === 2 && (
          <motion.div
            key="step-2"
            custom={direction}
            variants={prefersReduced ? undefined : stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: duration.base, ease: ease.entrance }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl font-bold font-display text-ink-950 mb-1">
                Choose your schedule
              </h2>
              <p className="text-sm text-ink-500">Select a date and time that works for you.</p>
            </div>

            {/* Date picker */}
            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-3">
                Select Date *
              </label>
              {/* Date strip. The selected highlight is one shared element moved
                  between days via `layoutId`, so it slides along the row
                  instead of blinking off one date and on at another. */}
              <div
                className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2"
                role="radiogroup"
                aria-label="Select a date"
              >
                {availableDates.slice(0, 10).map((date) => {
                  const isSelected = selectedDate === date.value;
                  return (
                    <motion.button
                      key={date.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() =>
                        setValue("date", date.value, { shouldValidate: true })
                      }
                      whileHover={prefersReduced ? undefined : { y: -3 }}
                      whileTap={prefersReduced ? undefined : { scale: 0.95 }}
                      transition={spring.snappy}
                      className={cn(
                        "relative flex-shrink-0 flex flex-col items-center px-3.5 py-3 rounded-xl border transition-colors duration-200 min-w-[64px]",
                        isSelected
                          ? "border-gold-500 text-gold-700"
                          : "border-ink-200 bg-canvas text-ink-600 hover:border-gold-500/30"
                      )}
                    >
                      {isSelected && (
                        <motion.span
                          layoutId="booking-date-pill"
                          className="absolute inset-0 rounded-xl bg-gradient-to-b from-gold-100 to-gold-200"
                          transition={spring.snappy}
                        />
                      )}
                      <span className="relative z-10 text-[10px] font-semibold uppercase">
                        {date.day}
                      </span>
                      <span className="relative z-10 text-xl font-black font-display">
                        {date.date}
                      </span>
                      <span className="relative z-10 text-[10px]">{date.month}</span>
                    </motion.button>
                  );
                })}
              </div>
              <FieldError message={errors.date?.message} />
            </div>

            {/* Time slots — revealed once a date exists, then cascading in, so
                the next required choice announces itself. */}
            <AnimatePresence initial={false}>
              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{
                    duration: prefersReduced ? 0 : duration.slow,
                    ease: ease.emphasized,
                  }}
                  style={{ overflow: "hidden" }}
                >
                  <label className="block text-xs font-semibold text-ink-700 mb-3">
                    Select Time (WAT) *
                  </label>
                  <motion.div
                    className="grid grid-cols-3 sm:grid-cols-4 gap-2"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: {},
                      visible: {
                        transition: {
                          staggerChildren: prefersReduced ? 0 : 0.025,
                          delayChildren: prefersReduced ? 0 : 0.1,
                        },
                      },
                    }}
                    role="radiogroup"
                    aria-label="Select a time"
                  >
                    {timeSlots.map((time) => {
                      const isSelected = selectedTime === time;
                      return (
                        <motion.button
                          key={time}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() =>
                            setValue("time", time, { shouldValidate: true })
                          }
                          variants={{
                            hidden: { opacity: 0, scale: 0.9, y: 6 },
                            visible: { opacity: 1, scale: 1, y: 0 },
                          }}
                          whileHover={prefersReduced ? undefined : { scale: 1.04 }}
                          whileTap={prefersReduced ? undefined : { scale: 0.95 }}
                          transition={spring.snappy}
                          className={cn(
                            "py-2.5 px-3 rounded-xl border text-xs font-medium transition-colors duration-200",
                            isSelected
                              ? "border-gold-500 bg-gradient-to-br from-gold-400 to-gold-500 text-white"
                              : "border-ink-200 bg-canvas text-ink-600 hover:border-gold-500/30"
                          )}
                        >
                          {time}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                  <FieldError message={errors.time?.message} />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => goToStep(1)}
                className="flex-1 py-3.5 border border-ink-200 text-ink-700 font-semibold text-sm rounded-xl hover:bg-ink-100 transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => goToStep(3)}
                disabled={!selectedDate || !selectedTime}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3.5 font-semibold text-sm rounded-xl transition-all duration-200",
                  selectedDate && selectedTime
                    ? "bg-gradient-to-r from-gold-400 to-gold-500 text-white hover:shadow-lg hover:scale-[1.01]"
                    : "bg-ink-100 text-ink-400 cursor-not-allowed"
                )}
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Service & Notes */}
        {step === 3 && (
          <motion.div
            key="step-3"
            custom={direction}
            variants={prefersReduced ? undefined : stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: duration.base, ease: ease.entrance }}
            className="space-y-5"
          >
            <div>
              <h2 className="text-xl font-bold font-display text-ink-950 mb-1">
                What do you need help with?
              </h2>
              <p className="text-sm text-ink-500">
                Select your service and tell us more about your project.
              </p>
            </div>

            {/* Summary */}
            {selectedDate && selectedTime && (
              <div className="bg-gold-100/50 border border-gold-200/60 rounded-xl p-4 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gold-500" />
                <div className="text-sm">
                  <span className="font-semibold text-ink-950">
                    {new Date(selectedDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-ink-600"> at {selectedTime}</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                Service Required *
              </label>
              <select
                {...register("service")}
                className={cn(
                  fieldBase,
                  errors.service ? "border-red-300" : "border-ink-200"
                )}
              >
                <option value="">Select a service</option>
                {services.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <FieldError message={errors.service?.message} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                Project Details / Notes
              </label>
              <textarea
                {...register("notes")}
                rows={4}
                className="w-full px-4 py-3 bg-canvas border border-ink-200 rounded-xl text-sm text-ink-950 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500/50 transition-all resize-none"
                placeholder="e.g. I need help with my 5,000-word MSc thesis on public health in Nigeria. Chapter 3 data analysis section needs SPSS support..."
              />
            </div>

            <SubmitError show={submitFailed}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                We couldn&apos;t confirm your booking. Please try again, or message
                us on WhatsApp at +234 708 432 1204 and we&apos;ll book you in
                manually.
              </span>
            </SubmitError>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="flex-1 py-3.5 border border-ink-200 text-ink-700 font-semibold text-sm rounded-xl hover:bg-ink-100 transition-colors"
              >
                Back
              </button>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3.5 bg-gradient-to-r from-gold-400 to-gold-500 text-white font-semibold text-sm rounded-xl transition-shadow duration-200 hover:shadow-layered-gold disabled:opacity-60 disabled:cursor-not-allowed"
                whileHover={prefersReduced || isSubmitting ? undefined : { scale: 1.01, y: -1 }}
                whileTap={prefersReduced || isSubmitting ? undefined : { scale: 0.985 }}
                transition={spring.snappy}
              >
                <SubmitLabel
                  pending={isSubmitting}
                  busy={
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Booking...
                    </>
                  }
                  idle={
                    <>
                      Confirm Booking
                      <ArrowRight className="w-4 h-4" />
                    </>
                  }
                />
              </motion.button>
            </div>

            <p className="text-center text-xs text-ink-400">
              By booking, you agree to our{" "}
              <Link href="/terms" className="text-gold-500 hover:underline">
                Terms of Service
              </Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-gold-500 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </motion.div>
        )}
        </AnimatePresence>
      </form>
    </div>
  );
}
