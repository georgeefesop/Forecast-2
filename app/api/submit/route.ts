import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db/client";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Generate slug from title
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Create submission
    const submission = {
      title: data.title,
      description: data.description,
      startAt: data.startAt,
      endAt: data.endAt || null,
      city: data.city,
      address: data.address,
      category: data.category,
      tags: data.tags ? data.tags.split(",").map((t: string) => t.trim()) : [],
      priceMin: data.priceMin ? parseFloat(data.priceMin) : null,
      priceMax: data.priceMax ? parseFloat(data.priceMax) : null,
      currency: data.currency || "EUR",
      ticketUrl: data.ticketUrl || null,
      imageUrl: data.imageUrl || null,
    };

    await db.query(
      `INSERT INTO submissions (user_id, payload_json, status)
       VALUES ($1, $2, 'pending')`,
      [session.user.id, JSON.stringify(submission)]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Submit error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
