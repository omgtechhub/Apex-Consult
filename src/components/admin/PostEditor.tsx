"use client";

/**
 * Post editor form, shared by the create and edit routes so the two cannot
 * drift apart in fields or validation.
 *
 * The body is a plain textarea holding the same lightweight markup the public
 * article renderer already understands (`## `, `### `, `- ` and blank-line
 * paragraphs). A rich-text editor would produce HTML the renderer cannot parse,
 * so the format is kept honest end to end rather than looking richer here than
 * it does on the site.
 */

import { useFormStatus } from "react-dom";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import Link from "next/link";

type PostFields = {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  category: string;
  coverImage: string;
  published: boolean;
};

const COVERS = [
  "student-focus",
  "graduates-joy",
  "peer-review",
  "graduates-group",
  "library-desks",
  "caps-sky",
  "reading-room",
  "study-group",
  "hero-library",
];

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-5 py-2.5 text-sm font-semibold text-white shadow-layered-gold disabled:opacity-70"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {pending ? "Saving…" : label}
    </button>
  );
}

const field =
  "w-full rounded-xl border border-ink-200 bg-surface px-4 py-2.5 text-sm text-ink-950 placeholder:text-ink-400 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30";
const label = "mb-1.5 block text-xs font-semibold text-ink-600";

export function PostEditor({
  action,
  heading,
  submitLabel,
  post,
  notice,
}: {
  action: (formData: FormData) => void;
  heading: string;
  submitLabel: string;
  post?: PostFields;
  notice?: string;
}) {
  return (
    <form action={action}>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-ink-950">{heading}</h1>
          {post?.slug && <p className="mt-1 text-sm text-ink-500">/blog/{post.slug}</p>}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/posts" className="text-sm font-medium text-ink-600 hover:text-ink-950">
            Cancel
          </Link>
          <Submit label={submitLabel} />
        </div>
      </header>

      {notice && (
        <p className="mb-6 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <CheckCircle2 className="h-4 w-4" /> {notice}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div>
            <label htmlFor="title" className={label}>Title</label>
            <input id="title" name="title" required defaultValue={post?.title} className={field} />
            {!post?.slug && (
              <p className="mt-1.5 text-xs text-ink-500">
                The URL is generated from the title and never changes afterwards.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="excerpt" className={label}>Excerpt</label>
            <textarea
              id="excerpt"
              name="excerpt"
              rows={2}
              defaultValue={post?.excerpt}
              className={field}
              placeholder="One or two sentences shown on the blog index."
            />
          </div>

          <div>
            <label htmlFor="content" className={label}>Body</label>
            <textarea
              id="content"
              name="content"
              rows={22}
              defaultValue={post?.content}
              className={`${field} font-mono text-[13px] leading-relaxed`}
              placeholder={"Opening paragraph.\n\n## A heading\n\nParagraph text.\n\n### A subheading\n\n- bullet\n- bullet"}
            />
            <p className="mt-1.5 text-xs text-ink-500">
              Use <code>## </code> for headings, <code>### </code> for subheadings,
              <code> - </code> for bullets, and a blank line between paragraphs.
              Read time is calculated automatically.
            </p>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-ink-200/60 bg-surface p-5">
            <label htmlFor="published" className="flex cursor-pointer items-start gap-3">
              <input
                id="published"
                name="published"
                type="checkbox"
                defaultChecked={post?.published}
                className="mt-0.5 h-4 w-4 rounded border-ink-300 text-gold-500 focus:ring-gold-500/40"
              />
              <span>
                <span className="block text-sm font-semibold text-ink-950">Published</span>
                <span className="block text-xs text-ink-500">
                  Unchecked posts stay hidden from the public blog.
                </span>
              </span>
            </label>
          </div>

          <div className="rounded-2xl border border-ink-200/60 bg-surface p-5">
            <label htmlFor="category" className={label}>Category</label>
            <input
              id="category"
              name="category"
              defaultValue={post?.category}
              className={field}
              placeholder="Research"
              list="post-categories"
            />
            <datalist id="post-categories">
              {["Research", "Scholarships", "Study Abroad", "Data Analysis", "Academic Writing", "Career"].map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>

            <label htmlFor="coverImage" className={`${label} mt-4`}>Cover image</label>
            <select id="coverImage" name="coverImage" defaultValue={post?.coverImage} className={field}>
              <option value="">None</option>
              {COVERS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-ink-500">
              Files in <code>/public/images</code>. Upload support comes later.
            </p>
          </div>
        </aside>
      </div>
    </form>
  );
}
