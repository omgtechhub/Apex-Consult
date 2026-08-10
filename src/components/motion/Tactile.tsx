"use client";

/**
 * Tactile
 * -------
 * Adds physical feedback to an existing button or link *without touching its
 * markup or classes* — lift on hover, compression on press, and an optional
 * ripple that originates from the exact point of contact.
 *
 * Designed as a wrapper rather than a replacement `<Button>` so the established
 * visual design is preserved verbatim; only the behaviour is enhanced.
 *
 * The ripple is keyed to `pointerdown`, not `click`, so the feedback lands on
 * contact rather than on release. That ~100ms difference is most of what makes
 * a control feel responsive.
 */

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { spring, duration, ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

const MotionLink = motion.create(Link);

type Ripple = { id: number; x: number; y: number; size: number };

type CommonProps = {
  children: React.ReactNode;
  className?: string;
  /** Emit a ripple from the contact point. */
  ripple?: boolean;
  /** Tint of the ripple. Match it to the surface it sits on. */
  rippleColor?: string;
  /** How far the control lifts on hover, in px. */
  lift?: number;
  /** Scale applied while pressed. */
  press?: number;
  disabled?: boolean;
};

type TactileLinkProps = CommonProps & {
  href: string;
  external?: boolean;
  onClick?: () => void;
  "aria-label"?: string;
};

type TactileButtonProps = CommonProps & {
  href?: undefined;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  "aria-label"?: string;
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
};

function useRipples(enabled: boolean) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextId = useRef(0);

  const spawn = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!enabled) return;
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      // Diameter must reach the furthest corner from the contact point.
      const size =
        Math.max(
          Math.hypot(e.clientX - rect.left, e.clientY - rect.top),
          Math.hypot(rect.right - e.clientX, e.clientY - rect.top),
          Math.hypot(e.clientX - rect.left, rect.bottom - e.clientY),
          Math.hypot(rect.right - e.clientX, rect.bottom - e.clientY)
        ) * 2;

      const id = nextId.current++;
      setRipples((prev) => [
        ...prev,
        { id, x: e.clientX - rect.left, y: e.clientY - rect.top, size },
      ]);
    },
    [enabled]
  );

  const retire = useCallback((id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return { ripples, spawn, retire };
}

function RippleLayer({
  ripples,
  color,
  onDone,
}: {
  ripples: Ripple[];
  color: string;
  onDone: (id: number) => void;
}) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
    >
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            className="absolute rounded-full"
            style={{
              left: r.x - r.size / 2,
              top: r.y - r.size / 2,
              width: r.size,
              height: r.size,
              background: color,
            }}
            initial={{ scale: 0, opacity: 0.45 }}
            animate={{ scale: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.slower, ease: ease.silk }}
            onAnimationComplete={() => onDone(r.id)}
          />
        ))}
      </AnimatePresence>
    </span>
  );
}

export function Tactile(props: TactileLinkProps | TactileButtonProps) {
  const {
    children,
    className,
    ripple = true,
    rippleColor = "rgba(255,255,255,0.5)",
    lift = 2,
    press = 0.97,
    disabled = false,
  } = props;

  const prefersReduced = useReducedMotion() ?? false;
  const rippleEnabled = ripple && !prefersReduced && !disabled;
  const { ripples, spawn, retire } = useRipples(rippleEnabled);

  const motionProps = prefersReduced
    ? {}
    : {
        whileHover: disabled ? undefined : { y: -lift, scale: 1 + lift * 0.005 },
        whileTap: disabled ? undefined : { scale: press, y: 0 },
        transition: spring.snappy,
      };

  // `relative` is required for ripple positioning; `isolate` keeps the ripple's
  // stacking context local so it can't paint over sibling content.
  const classes = cn("relative isolate", className);

  if ("href" in props && props.href) {
    const { href, external, onClick } = props;
    return (
      <MotionLink
        href={href}
        onClick={onClick}
        onPointerDown={spawn}
        className={classes}
        aria-label={props["aria-label"]}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...motionProps}
      >
        {children}
        {rippleEnabled && (
          <RippleLayer ripples={ripples} color={rippleColor} onDone={retire} />
        )}
      </MotionLink>
    );
  }

  const { onClick, type = "button" } = props as TactileButtonProps;
  return (
    <motion.button
      type={type}
      onClick={onClick}
      onPointerDown={spawn}
      disabled={disabled}
      className={classes}
      aria-label={props["aria-label"]}
      aria-expanded={(props as TactileButtonProps)["aria-expanded"]}
      aria-controls={(props as TactileButtonProps)["aria-controls"]}
      {...motionProps}
    >
      {children}
      {rippleEnabled && (
        <RippleLayer ripples={ripples} color={rippleColor} onDone={retire} />
      )}
    </motion.button>
  );
}
