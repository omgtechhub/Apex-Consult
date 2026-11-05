import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

/**
 * sitemap.xml
 * ----------------------------------------------------------------------------
 * Enumerated by hand rather than crawled, because the two dynamic sections get
 * their content from different places and only one of them is trustworthy:
 *
 *   /services/[slug] — `serviceData`, a literal in the page module. Stable.
 *   /blog/[slug]     — the `posts` literal in blog/page.tsx. Stable.
 *   /scholarships/[slug] — the Pipeline API, which currently publishes nothing
 *                          and is served from the curated fallback. Listing
 *                          those URLs would advertise pages whose content can
 *                          disappear the moment the API starts answering, so
 *                          only the index is listed.
 *
 * `priority` is deliberately sparse. It is a relative hint within one site, and
 * marking everything important means marking nothing important.
 */

const now = new Date();

/** Marketing and conversion surfaces, highest intent first. */
const CORE: Array<[path: string, priority: number, freq: MetadataRoute.Sitemap[number]["changeFrequency"]]> = [
  ["/", 1.0, "weekly"],
  ["/services", 0.9, "monthly"],
  ["/pricing", 0.9, "monthly"],
  ["/book", 0.9, "monthly"],
  ["/contact", 0.8, "monthly"],
  ["/about", 0.7, "monthly"],
  ["/scholarships", 0.8, "daily"],
  ["/study-abroad", 0.8, "monthly"],
  ["/blog", 0.7, "weekly"],
  ["/faq", 0.7, "monthly"],
  ["/testimonials", 0.6, "monthly"],
  ["/resources", 0.6, "monthly"],
];

/** Required for trust, not for ranking. */
const LEGAL = ["/privacy", "/terms", "/cookies", "/refund"];

/** Mirrors `serviceData` in src/app/services/[slug]/page.tsx. */
const SERVICE_SLUGS = [
  "project-writing",
  "proofreading",
  "research-assistance",
  "data-analysis",
  "cv-sop",
  "admission",
  "scholarship",
  "business-proposals",
  "journal-formatting",
  "assignments",
];

/** Mirrors the `posts` literal in src/app/blog/page.tsx. */
const BLOG_SLUGS = [
  "how-to-write-a-perfect-research-proposal",
  "chevening-scholarship-guide-nigerians",
  "spss-data-analysis-beginners",
  "statement-of-purpose-tips",
  "avoid-plagiarism-academic-writing",
  "uk-student-visa-guide",
  "literature-review-guide",
  "academic-cv-writing",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...CORE.map(([path, priority, changeFrequency]) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency,
      priority,
    })),

    ...SERVICE_SLUGS.map((slug) => ({
      url: absoluteUrl(`/services/${slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),

    ...BLOG_SLUGS.map((slug) => ({
      url: absoluteUrl(`/blog/${slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),

    ...LEGAL.map((path) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
