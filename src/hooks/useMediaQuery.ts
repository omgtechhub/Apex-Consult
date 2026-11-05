"use client";

import { useSyncExternalStore } from "react";

/**
 * useMediaQuery
 * -------------
 * Subscribes to a CSS media query as an external store.
 *
 * `useSyncExternalStore` rather than `useEffect` + `setState`: matchMedia *is*
 * an external store, and subscribing to it this way avoids the cascading render
 * a synchronous setState inside an effect causes, while giving React a correct,
 * tearing-free snapshot during concurrent rendering.
 *
 * IMPORTANT — the SSR contract. There is no viewport or input device on the
 * server, so every query reports `false` until hydration. Callers must phrase
 * the query so that `false` is the *inert* state: effects switch on after
 * hydration, never off. Enabling after hydration is invisible; disabling is a
 * visible flicker.
 */

/**
 * One MediaQueryList per query for the whole app, created lazily so this module
 * stays importable on the server.
 *
 * `getSnapshot` is called by React on every render and again on every store
 * check, so building a fresh MediaQueryList in there allocates a new native
 * object dozens of times per interaction. Matching against a cached list is
 * free and returns the identical value.
 */
const lists = new Map<string, MediaQueryList>();

function getList(query: string): MediaQueryList {
  let mq = lists.get(query);
  if (!mq) {
    mq = window.matchMedia(query);
    lists.set(query, mq);
  }
  return mq;
}

/**
 * The `subscribe` and `getSnapshot` closures are cached per query too.
 *
 * React compares them by identity and treats a new `subscribe` as a new store —
 * a fresh arrow function per render would tear down and re-add the `change`
 * listener on every single render.
 */
const subscribers = new Map<string, (onChange: () => void) => () => void>();
const snapshots = new Map<string, () => boolean>();

function getSubscribe(query: string) {
  let subscribe = subscribers.get(query);
  if (!subscribe) {
    subscribe = (onChange: () => void) => {
      const mq = getList(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    };
    subscribers.set(query, subscribe);
  }
  return subscribe;
}

function getSnapshot(query: string) {
  let snapshot = snapshots.get(query);
  if (!snapshot) {
    snapshot = () => getList(query).matches;
    snapshots.set(query, snapshot);
  }
  return snapshot;
}

// See the SSR contract in the file header.
function getServerSnapshot() {
  return false;
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    getSubscribe(query),
    getSnapshot(query),
    getServerSnapshot
  );
}
