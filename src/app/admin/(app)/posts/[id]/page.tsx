import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { posts, activityLog } from "@/db/schema";
import { getStaffUser, can } from "@/lib/auth";
import { PostEditor } from "@/components/admin/PostEditor";
import { estimateReadTime } from "@/lib/post-utils";

export const metadata = { title: "Edit post" };

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;
  const postId = Number(id);
  if (!Number.isInteger(postId)) notFound();

  const post = (await db.select().from(posts).where(eq(posts.id, postId)).limit(1))[0];
  if (!post) notFound();

  async function update(formData: FormData) {
    "use server";
    const actor = await getStaffUser();
    if (!can(actor, "manage-posts")) throw new Error("Not permitted");

    const title = String(formData.get("title") || "").trim();
    const content = String(formData.get("content") || "");
    if (!title) throw new Error("Title is required");

    // The slug is intentionally NOT regenerated on edit. Changing it would
    // break every existing link to the article the moment someone fixes a typo
    // in the headline.
    await db
      .update(posts)
      .set({
        title,
        excerpt: String(formData.get("excerpt") || "").trim() || null,
        content,
        category: String(formData.get("category") || "").trim() || null,
        coverImage: String(formData.get("coverImage") || "").trim() || null,
        readTime: estimateReadTime(content),
        published: formData.get("published") === "on",
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId));

    await db.insert(activityLog).values({
      userId: actor!.id,
      action: "edited post",
      entityType: "post",
      entityId: String(postId),
      detail: title,
    });

    revalidatePath("/admin/posts");
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    redirect("/admin/posts");
  }

  return (
    <PostEditor
      action={update}
      heading="Edit post"
      submitLabel="Save changes"
      notice={created === "1" ? "Post created." : undefined}
      post={{
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? "",
        content: post.content ?? "",
        category: post.category ?? "",
        coverImage: post.coverImage ?? "",
        published: post.published ?? false,
      }}
    />
  );
}
