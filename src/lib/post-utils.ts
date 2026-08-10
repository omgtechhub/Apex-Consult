/**
 * Slug and read-time helpers.
 *
 * Kept out of the page files so the new-post and edit-post actions cannot drift
 * apart in how they derive these values.
 */

/** URL-safe slug. Strips accents so "Café" and "Cafe" don't produce two URLs. */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

/** ~200 wpm, the usual figure for online prose. Always at least 1. */
export function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
