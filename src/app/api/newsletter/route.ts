import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscribers } from "@/db/schema";

export async function POST(request: NextRequest) {
  try {
    // Handle both form submissions and JSON
    let email: string;
    let name: string | undefined;

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      email = body.email;
      name = body.name;
    } else {
      const formData = await request.formData();
      email = formData.get("email") as string;
      name = formData.get("name") as string | undefined;
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await db
      .insert(subscribers)
      .values({ email, name })
      .onConflictDoNothing();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
