"use client";

/**
 * BlogExplorer
 * ------------
 * Category filtering for the blog index.
 *
 * The filter pills previously rendered as buttons that did nothing — a control
 * that looks interactive but isn't is worse than no control at all, so this
 * makes them real. The page itself stays a server component (it owns the route
 * metadata); only the interactive grid is client-side.
 *
 * Motion carries two pieces of information here:
 *  - the active pill's background is a single shared element (`layoutId`), so
 *    it *slides* between categories rather than blinking off and on. The eye
 *    tracks one object and the change of state is unambiguous.
 *  - cards animate out and in through `AnimatePresence` with `popLayout`, so
 *    the surviving cards reflow to their new positions instead of snapping.
 */

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import { duration, ease, spring, stagger, travel } from "@/lib/motion";

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: number;
  date: string;
  featured: boolean;
  /** Basename of a file in /public/images, without extension. */
  cover: string;
};

export function BlogExplorer({
  posts,
  categories,
}: {
  posts: Post[];
  categories: string[];
}) {
  const [active, setActive] = useState("All");
  const prefersReduced = useReducedMotion() ?? false;

  const visible =
    active === "All" ? posts : posts.filter((p) => p.category === active);
  const featured = visible.filter((p) => p.featured);
  const regular = visible.filter((p) => !p.featured);

  const cardMotion = {
    initial: prefersReduced
      ? { opacity: 0 }
      : { opacity: 0, y: travel.md, filter: "blur(6px)" },
    animate: prefersReduced
      ? { opacity: 1 }
      : { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: prefersReduced
      ? { opacity: 0 }
      : { opacity: 0, scale: 0.96, filter: "blur(4px)" },
  };

  return (
    <>
      {/* Category filter */}
      <div
        role="tablist"
        aria-label="Filter articles by category"
        className="flex flex-wrap gap-2 mb-12"
      >
        {categories.map((cat) => {
          const isActive = cat === active;
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(cat)}
              className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas active:scale-95 ${
                isActive
                  ? "text-white"
                  : "bg-surface border border-ink-200 text-ink-600 hover:border-gold-500/30 hover:text-ink-950"
              }`}
            >
              {/* The moving pill. Rendered behind the label and shared across
                  every button, so Framer animates one element between slots. */}
              {isActive && (
                <motion.span
                  layoutId="blog-category-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 shadow-md"
                  transition={prefersReduced ? { duration: 0 } : spring.snappy}
                />
              )}
              <span className="relative z-10">{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Featured posts */}
      {featured.length > 0 && (
        <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AnimatePresence mode="popLayout" initial={false}>
            {featured.map((post, i) => (
              <motion.div
                key={post.slug}
                layout
                {...cardMotion}
                transition={{
                  duration: prefersReduced ? duration.fast : duration.slow,
                  delay: prefersReduced ? 0 : i * stagger.base,
                  ease: ease.entrance,
                }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col bg-surface border border-ink-200/60 rounded-3xl hover:shadow-xl hover:-translate-y-1 hover:border-gold-500/30 transition-all duration-300 ease-standard overflow-hidden"
                >
                  {/* Thumbnail. `aspect-[16/9]` reserves the box before the
                      image decodes, so the card never jumps as covers load. */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-ink-100">
                    <Image
                      src={`/images/${post.cover}.jpg`}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 ease-silk group-hover:scale-105"
                    />
                    <span className="absolute top-4 left-4 px-2.5 py-1 bg-surface/95 text-gold-600 text-xs font-bold rounded-full shadow-sm">
                      {post.category}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-8 lg:p-10">
                    <span className="text-ink-500 text-xs mb-3">Featured</span>
                    <h2 className="text-xl font-black font-display text-ink-950 mb-3 group-hover:text-gold-600 transition-colors duration-300 ease-standard leading-tight">
                      {post.title}
                    </h2>
                    <p className="text-ink-600 text-sm leading-relaxed mb-6 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-ink-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{post.readTime} min read</span>
                        <span>·</span>
                        <span>{post.date}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gold-500 group-hover:translate-x-1 transition-transform duration-300 ease-standard" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Regular posts */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {regular.map((post, i) => (
            <motion.div
              key={post.slug}
              layout
              {...cardMotion}
              transition={{
                duration: prefersReduced ? duration.fast : duration.slow,
                delay: prefersReduced ? 0 : i * stagger.tight,
                ease: ease.entrance,
              }}
            >
              <Link
                href={`/blog/${post.slug}`}
                className="group flex h-full flex-col overflow-hidden bg-surface border border-ink-200/60 rounded-2xl hover:border-gold-500/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-standard"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-ink-100">
                  <Image
                    src={`/images/${post.cover}.jpg`}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 ease-silk group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2.5 py-1 bg-gold-100 text-gold-700 text-[10px] font-bold rounded-full uppercase tracking-wide">
                      {post.category}
                    </span>
                  </div>
                  <h2 className="font-bold text-ink-950 text-base font-display mb-3 group-hover:text-gold-600 transition-colors duration-300 ease-standard leading-tight line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-sm text-ink-600 leading-relaxed mb-5 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto flex items-center justify-between text-xs text-ink-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>{post.readTime} min read</span>
                    </div>
                    <span>{post.date}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty state — a filter that silently shows nothing reads as breakage */}
      <AnimatePresence>
        {visible.length === 0 && (
          <motion.p
            className="text-center text-ink-500 py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.base }}
          >
            No articles in this category yet — check back soon.
          </motion.p>
        )}
      </AnimatePresence>
    </>
  );
}
