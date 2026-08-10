import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { posts, activityLog } from "@/db/schema";
import { getStaffUser, can } from "@/lib/auth";
import { PostEditor } from "@/components/admin/PostEditor";
import { slugify, estimateReadTime } from "@/lib/post-utils";

export const metadata = { title: "New post" };

export default async function NewPostPage() {
  async function create(formData: FormData) {
    "use server";
    const actor = await getStaffUser();
    if (!can(actor, "manage-posts")) throw new Error("Not permitted");

    const title = String(formData.get("title") || "").trim();
    const content = String(formData.get("content") || "");
    if (!title) throw new Error("Title is required");

    // Slug is derived server-side. Accepting one from the form would let a
    // typo — or a deliberate value — collide with an existing post's URL.
    const slug = slugify(title);

    const inserted = await db
      .insert(posts)
      .values({
        title,
        slug,
        excerpt: String(formData.get("excerpt") || "").trim() || null,
        content,
        category: String(formData.get("category") || "").trim() || null,
        coverImage: String(formData.get("coverImage") || "").trim() || null,
        readTime: estimateReadTime(content),
        published: formData.get("published") === "on",
      })
      .returning({ id: posts.id });

    await db.insert(activityLog).values({
      userId: actor!.id,
      action: "created post",
      entityType: "post",
      entityId: String(inserted[0].id),
      detail: title,
    });

    revalidatePath("/admin/posts");
    revalidatePath("/blog");
    redirect(`/admin/posts/${inserted[0].id}?created=1`);
  }

  return <PostEditor action={create} heading="New post" submitLabel="Create post" />;
}
