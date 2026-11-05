import { Fragment, type ReactNode } from "react";

/**
 * Minimal Markdown renderer for pipeline-generated article content.
 * ----------------------------------------------------------------------------
 * The Scholarship Pipeline stores articles as Markdown. The detail page used to
 * print that string inside `whitespace-pre-line`, so readers saw the source:
 * "# Chevening Scholarships 2026", literal `**` around every bold run — 28 of
 * them on one page. The `prose` classes it also carried did nothing, because
 * `@tailwindcss/typography` is not installed.
 *
 * This renders the subset the generator actually emits, rather than pulling in
 * a parser:
 *
 *   #, ##, ###, ####   headings
 *   - / * bullets      unordered lists
 *   1.                 ordered lists
 *   **bold**           inline emphasis
 *   bare URLs          links
 *   blank line         paragraph break
 *
 * Deliberately not supported: raw HTML, images, tables, code fences. None
 * appear in generated output, and accepting raw HTML from an AI pipeline into
 * `dangerouslySetInnerHTML` would be an injection hole for the sake of markup
 * nobody is writing.
 */

type Block =
  | { kind: "heading"; level: 1 | 2 | 3 | 4; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "p"; text: string };

const HEADING = /^(#{1,4})\s+(.*)$/;
const BULLET = /^[-*]\s+(.*)$/;
const ORDERED = /^\d+[.)]\s+(.*)$/;

export function parseMarkdown(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) {
      blocks.push({ kind: "p", text: para.join(" ").trim() });
      para = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushPara();
      continue;
    }

    const heading = trimmed.match(HEADING);
    if (heading) {
      flushPara();
      blocks.push({
        kind: "heading",
        level: heading[1].length as 1 | 2 | 3 | 4,
        text: heading[2].trim(),
      });
      continue;
    }

    // A list run is consumed whole, so a single item cannot start a new <ul>
    // on every line and produce one list per bullet.
    const bullet = trimmed.match(BULLET);
    const ordered = trimmed.match(ORDERED);
    if (bullet || ordered) {
      flushPara();
      const isOrdered = Boolean(ordered);
      const items: string[] = [];
      let j = i;
      for (; j < lines.length; j++) {
        const t = lines[j].trim();
        if (!t) break;
        const b = t.match(isOrdered ? ORDERED : BULLET);
        if (!b) break;
        items.push(b[1].trim());
      }
      blocks.push({ kind: isOrdered ? "ol" : "ul", items });
      i = j - 1;
      continue;
    }

    para.push(trimmed);
  }

  flushPara();
  return blocks;
}

/**
 * Inline pass: **bold** and bare URLs.
 *
 * Split on both patterns at once so a URL inside a bold run, or bold text after
 * a URL, cannot be swallowed by whichever pass ran first.
 */
const INLINE = /(\*\*[^*]+\*\*|https?:\/\/[^\s<>()[\]]+)/g;

export function renderInline(text: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    if (!part) return null;

    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} className="font-semibold text-ink-950">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          /* `break-all` because these are long DAAD query-string URLs; without
             it a single one is wider than the column and forces a scrollbar. */
          className="text-brand-600 underline underline-offset-2 break-all hover:text-brand-700"
        >
          {part}
        </a>
      );
    }

    return <Fragment key={i}>{part}</Fragment>;
  });
}

/**
 * `#` is rendered as `h3` and so on down: the page already owns an `h1` (the
 * scholarship title) and an `h2` (the card heading), so starting the article at
 * `h1` would break the document outline for screen readers.
 */
const HEADING_CLASS: Record<1 | 2 | 3 | 4, string> = {
  1: "text-2xl font-black font-display text-ink-950 mt-10 first:mt-0 mb-3",
  2: "text-xl font-bold font-display text-ink-950 mt-8 first:mt-0 mb-3",
  3: "text-lg font-bold text-ink-950 mt-6 first:mt-0 mb-2",
  4: "text-base font-semibold text-ink-950 mt-5 first:mt-0 mb-2",
};

export function MarkdownContent({
  content,
  className = "",
  skipLeadingHeading = false,
}: {
  content: string;
  className?: string;
  /**
   * Drop a leading `#` heading.
   *
   * The generator opens every article with its own title, and the scholarship
   * page already prints that title above the body — so the reader saw it twice
   * in a row, once as the card heading and again as the first line of the
   * article.
   */
  skipLeadingHeading?: boolean;
}) {
  const parsed = parseMarkdown(content);
  const kept =
    skipLeadingHeading && parsed[0]?.kind === "heading" && parsed[0].level === 1
      ? parsed.slice(1)
      : parsed;

  /**
   * Normalise so the shallowest heading present always renders as `h3`.
   *
   * Dropping the leading `#` leaves `##` as the top level, which mapped to
   * `h4` and skipped `h3` entirely — the card's `h2` sat directly above an
   * `h4`. Shifting by the shallowest level keeps the document outline
   * contiguous whether or not the first heading was removed.
   */
  const shallowest = kept.reduce(
    (min, b) => (b.kind === "heading" && b.level < min ? b.level : min),
    4 as 1 | 2 | 3 | 4
  );
  const blocks = kept.map((b) =>
    b.kind === "heading"
      ? { ...b, level: Math.min(4, b.level - shallowest + 1) as 1 | 2 | 3 | 4 }
      : b
  );

  return (
    <div className={`text-ink-700 leading-relaxed break-words ${className}`}>
      {blocks.map((block, i) => {
        if (block.kind === "heading") {
          const Tag = (["h3", "h4", "h5", "h6"] as const)[block.level - 1];
          return (
            <Tag key={i} className={HEADING_CLASS[block.level]}>
              {renderInline(block.text)}
            </Tag>
          );
        }

        if (block.kind === "ul" || block.kind === "ol") {
          const Tag = block.kind === "ol" ? "ol" : "ul";
          return (
            <Tag
              key={i}
              className={`mb-4 space-y-1.5 pl-5 ${
                block.kind === "ol" ? "list-decimal" : "list-disc"
              } marker:text-brand-500`}
            >
              {block.items.map((item, j) => (
                <li key={j} className="pl-1">
                  {renderInline(item)}
                </li>
              ))}
            </Tag>
          );
        }

        return (
          <p key={i} className="mb-4 last:mb-0">
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
}
