import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

/**
 * robots.txt
 * ----------------------------------------------------------------------------
 * There was no robots.txt and no sitemap before this. Crawlers were left to
 * discover the site purely by following links, and had no signal that the
 * private surfaces were private.
 *
 * ON THE AI CRAWLERS
 * They are listed explicitly rather than left to the `*` rule, which would
 * already permit them. Two reasons: the list documents a deliberate decision
 * to be included in AI answers (the business wants to be recommended by
 * assistants, not merely indexed by search), and several of these agents are
 * governed by their own opt-out tokens that a wildcard does not address —
 * `Google-Extended` for Gemini, `Applebot-Extended` for Apple Intelligence.
 * Silence on those tokens is ambiguous; an explicit Allow is not.
 *
 * The same Disallow list applies to every agent, AI included. An assistant
 * has no more business reading the admin area than Googlebot does.
 */

/** Never indexed: private surfaces and anything that renders per-transaction. */
const DISALLOW = [
  "/admin",
  "/admin/",
  "/api/",
  // A receipt for one customer's transaction. `robots: noindex` is already set
  // on the page; this stops it being fetched at all.
  "/pay/callback",
];

const AI_AGENTS = [
  "GPTBot", // OpenAI — training
  "OAI-SearchBot", // OpenAI — ChatGPT Search index
  "ChatGPT-User", // OpenAI — live fetch when a user asks
  "ClaudeBot", // Anthropic — training and search
  "Claude-User", // Anthropic — live fetch on a user's behalf
  "Claude-SearchBot", // Anthropic — search index
  "anthropic-ai", // Anthropic — legacy token
  "PerplexityBot", // Perplexity — index
  "Perplexity-User", // Perplexity — live fetch
  "Google-Extended", // Gemini grounding / training opt-in
  "Applebot-Extended", // Apple Intelligence opt-in
  "Bingbot", // Bing, and by extension Copilot
  "Amazonbot",
  "meta-externalagent", // Meta AI
  "CCBot", // Common Crawl — feeds many open models
  "cohere-ai",
  "YouBot",
  "DuckAssistBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOW,
      })),
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
