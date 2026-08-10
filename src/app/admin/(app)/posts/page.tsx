import Link from "next/link";
import { revalidatePath } from "next/cache";
import { desc, eq } from "drizzle-orm";
import { Plus, Pencil } from "lucide-react";
import { db } from "@/db";
import { posts, activityLog } from "@/db/schema";
import { getStaffUser, can } from "@/lib/auth";

export const metadata = { title: "Blog posts" };

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const user = await getStaffUser();

  const rows = await db
    .select()
    .from(posts)
    .where(status === "draft" ? eq(posts.published, false) : undefined)
    .orderBy(desc(posts.createdAt));

  /**
   * Publish toggle.
   *
   * Re-reads the row inside the action rather than trusting a `published` value
   * posted from the client — otherwise a crafted form could flip any post to
   * any state regardless of what the UI showed.
   */
  async function togglePublished(formData: FormData) {
    "use server";
    const actor = await getStaffUser();
    if (!can(actor, "manage-posts")) throw new Error("Not permitted");

    const id = Number(formData.get("id"));
    if (!Number.isInteger(id)) throw new Error("Bad id");

    const current = (await db.select().from(posts).where(eq(posts.id, id)).limit(1))[0];
    if (!current) throw new Error("Post not found");

    const next = !current.published;
    await db
      .update(posts)
      .set({ published: next, updatedAt: new Date() })
      .where(eq(posts.id, id));

    await db.insert(activityLog).values({
      userId: actor!.id,
      action: next ? "published post" : "unpublished post",
      entityType: "post",
      entityId: String(id),
      detail: current.title,
    });

    revalidatePath("/admin/posts");
    revalidatePath("/blog");
  }

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-ink-950">Blog posts</h1>
          <p className="mt-1 text-sm text-ink-600">
            {rows.length} {rows.length === 1 ? "post" : "posts"}
            {status === "draft" ? " · showing drafts" : ""}
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-4 py-2.5 text-sm font-semibold text-white shadow-layered-gold"
        >
          <Plus className="h-4 w-4" /> New post
        </Link>
      </header>

      <div className="mb-6 flex gap-2">
        <Link
          href="/admin/posts"
          className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${
            !status ? "border-gold-500/40 bg-gold-100 text-gold-700" : "border-ink-200 text-ink-600"
          }`}
        >
          All
        </Link>
        <Link
          href="/admin/posts?status=draft"
          className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${
            status === "draft" ? "border-gold-500/40 bg-gold-100 text-gold-700" : "border-ink-200 text-ink-600"
          }`}
        >
          Drafts
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-300 bg-surface p-12 text-center">
          <p className="text-sm text-ink-600">No posts yet.</p>
          <Link href="/admin/posts/new" className="mt-3 inline-block text-sm font-semibold text-gold-600 hover:underline">
            Write the first one
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200/60 bg-surface">
          <ul className="divide-y divide-ink-200/60">
            {rows.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
                        p.published ? "bg-green-500" : "bg-ink-300"
                      }`}
                      aria-hidden="true"
                    />
                    <h2 className="truncate font-medium text-ink-950">{p.title}</h2>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-ink-500">
                    /{p.slug} · {p.category ?? "Uncategorised"} ·{" "}
                    {p.published ? "Published" : "Draft"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <form action={togglePublished}>
                    <input type="hidden" name="id" value={p.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 transition-colors hover:border-gold-500/40 hover:text-gold-700"
                    >
                      {p.published ? "Unpublish" : "Publish"}
                    </button>
                  </form>
                  <Link
                    href={`/admin/posts/${p.id}`}
                    className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 transition-colors hover:border-gold-500/40 hover:text-gold-700"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!can(user, "manage-posts") && (
        <p className="mt-4 text-xs text-ink-500">
          Your account cannot modify posts.
        </p>
      )}
    </div>
  );
}
