import Link from "next/link";
import { count, eq, desc } from "drizzle-orm";
import { FileText, MessagesSquare, MessageSquareText, Quote } from "lucide-react";
import { db } from "@/db";
import { posts, threads, comments, testimonials, activityLog, users } from "@/db/schema";
import { getStaffUser, can } from "@/lib/auth";

export const metadata = { title: "Dashboard" };

/** Counts are cheap aggregate queries; run them together rather than serially. */
async function loadStats() {
  const [postCount, draftCount, openThreads, pendingComments, pendingTestimonials] =
    await Promise.all([
      db.select({ n: count() }).from(posts),
      db.select({ n: count() }).from(posts).where(eq(posts.published, false)),
      db.select({ n: count() }).from(threads).where(eq(threads.status, "open")),
      db.select({ n: count() }).from(comments).where(eq(comments.status, "pending")),
      db.select({ n: count() }).from(testimonials).where(eq(testimonials.approved, false)),
    ]);

  return {
    posts: postCount[0]?.n ?? 0,
    drafts: draftCount[0]?.n ?? 0,
    openThreads: openThreads[0]?.n ?? 0,
    pendingComments: pendingComments[0]?.n ?? 0,
    pendingTestimonials: pendingTestimonials[0]?.n ?? 0,
  };
}

export default async function AdminDashboard() {
  const user = await getStaffUser();
  const stats = await loadStats();

  const recent = can(user, "view-activity")
    ? await db
        .select({
          id: activityLog.id,
          action: activityLog.action,
          entityType: activityLog.entityType,
          detail: activityLog.detail,
          createdAt: activityLog.createdAt,
          who: users.name,
        })
        .from(activityLog)
        .leftJoin(users, eq(users.id, activityLog.userId))
        .orderBy(desc(activityLog.createdAt))
        .limit(8)
    : [];

  const tiles = [
    { label: "Published posts", value: stats.posts - stats.drafts, href: "/admin/posts", icon: FileText },
    { label: "Drafts", value: stats.drafts, href: "/admin/posts?status=draft", icon: FileText },
    { label: "Open threads", value: stats.openThreads, href: "/admin/threads", icon: MessagesSquare },
    ...(can(user, "moderate-comments")
      ? [{ label: "Comments awaiting review", value: stats.pendingComments, href: "/admin/comments", icon: MessageSquareText }]
      : []),
    ...(can(user, "moderate-testimonials")
      ? [{ label: "Testimonials awaiting review", value: stats.pendingTestimonials, href: "/admin/testimonials", icon: Quote }]
      : []),
  ];

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-black text-ink-950">
          Welcome back, {user?.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          {user?.role === "admin"
            ? "You have full access, including moderation and staff management."
            : "You can write posts and handle your client conversations."}
        </p>
      </header>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className="group rounded-2xl border border-ink-200/60 bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-brand-500/30 hover:shadow-layered"
          >
            <div className="mb-3 flex items-center justify-between">
              <t.icon className="h-4 w-4 text-brand-500" />
              <span className="text-3xl font-black tabular-nums text-ink-950 font-display">
                {t.value}
              </span>
            </div>
            <div className="text-sm text-ink-600">{t.label}</div>
          </Link>
        ))}
      </div>

      {can(user, "view-activity") && (
        <section>
          <h2 className="mb-4 font-display text-lg font-bold text-ink-950">Recent staff activity</h2>
          <div className="overflow-hidden rounded-2xl border border-ink-200/60 bg-surface">
            {recent.length === 0 ? (
              <p className="p-6 text-sm text-ink-500">Nothing recorded yet.</p>
            ) : (
              <ul className="divide-y divide-ink-200/60">
                {recent.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-4 px-5 py-3.5 text-sm">
                    <span className="text-ink-950">
                      <span className="font-medium">{r.who ?? "Deleted user"}</span>{" "}
                      <span className="text-ink-600">{r.action}</span>
                      {r.entityType ? <span className="text-ink-500"> · {r.entityType}</span> : null}
                    </span>
                    <time className="shrink-0 text-xs text-ink-500">
                      {r.createdAt?.toLocaleString() ?? ""}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
