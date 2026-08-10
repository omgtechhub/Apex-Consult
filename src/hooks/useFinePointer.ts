"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(pointer: fine)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

// The server can't know the input device. Reporting `false` means pointer-driven
// effects render inert and then enable after hydration — never the reverse.
// Enabling after hydration is invisible; disabling is a visible flicker.
function getServerSnapshot() {
  return false;
}

/**
 * True when the primary input is a mouse/trackpad rather than touch.
 *
 * Uses `useSyncExternalStore` rather than `useEffect` + `setState`: matchMedia
 * is an external store, and subscribing to it this way avoids the cascading
 * render that a synchronous setState inside an effect causes, while giving
 * React a correct, tearing-free snapshot during concurrent rendering.
 */
export function useFinePointer(): boolean {
  // `subscribe` is module-level and therefore already referentially stable —
  // wrapping it in useCallback would add a hook without changing anything.
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
