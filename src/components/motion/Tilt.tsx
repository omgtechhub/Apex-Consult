"use client";

/**
 * Tilt
 * ----
 * Pointer-driven 3D card tilt with an optional specular sheen that tracks the
 * cursor, so the card reads as a lit physical surface rather than a rotating
 * rectangle.
 *
 * Kept subtle on purpose: max ~7deg. Anything past ~10deg starts to distort
 * text rendering and reads as a gimmick instead of depth.
 */

import { useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";
import { spring } from "@/lib/motion";
import { useFinePointer } from "@/hooks/useFinePointer";
import { cn } from "@/lib/utils";

type TiltProps = {
  children: React.ReactNode;
  className?: string;
  /** Maximum rotation in degrees on each axis. */
  max?: number;
  /** Render a cursor-tracking highlight over the surface. */
  sheen?: boolean;
  /** Lift toward the viewer, in px, while hovered. */
  lift?: number;
};

export function Tilt({
  children,
  className,
  max = 7,
  sheen = true,
  lift = 8,
}: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rect = useRef<DOMRect | null>(null);
  const prefersReduced = useReducedMotion() ?? false;
  const finePointer = useFinePointer();

  // Normalised pointer position within the card, −0.5 → 0.5.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const hover = useMotionValue(0);

  const sx = useSpring(px, spring.smooth);
  const sy = useSpring(py, spring.smooth);
  const sHover = useSpring(hover, spring.smooth);

  // Invert Y so pushing the cursor up tips the top edge away from the viewer.
  const rotateX = useTransform(sy, [-0.5, 0.5], [max, -max]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-max, max]);
  const z = useTransform(sHover, [0, 1], [0, lift]);

  const sheenX = useTransform(sx, [-0.5, 0.5], ["0%", "100%"]);
  const sheenY = useTransform(sy, [-0.5, 0.5], ["0%", "100%"]);
  const sheenOpacity = useTransform(sHover, [0, 1], [0, 0.5]);
  const sheenBg = useMotionTemplate`radial-gradient(circle at ${sheenX} ${sheenY}, rgba(255,255,255,0.55), transparent 55%)`;

  const handleEnter = useCallback(() => {
    rect.current = ref.current?.getBoundingClientRect() ?? null;
    hover.set(1);
  }, [hover]);

  const handleMove = useCallback(
    (e: React.PointerEvent) => {
      const r = rect.current;
      if (!r) return;
      px.set((e.clientX - r.left) / r.width - 0.5);
      py.set((e.clientY - r.top) / r.height - 0.5);
    },
    [px, py]
  );

  const handleLeave = useCallback(() => {
    rect.current = null;
    px.set(0);
    py.set(0);
    hover.set(0);
  }, [px, py, hover]);

  if (prefersReduced || !finePointer) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={cn("relative", className)}
      onPointerEnter={handleEnter}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{
        rotateX,
        rotateY,
        z,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
      {sheen && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-soft-light"
          style={{ background: sheenBg, opacity: sheenOpacity }}
        />
      )}
    </motion.div>
  );
}
