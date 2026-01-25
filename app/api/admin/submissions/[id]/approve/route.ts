import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: submissionId } = await params;

    // Get submission
    const submission = await db.query(
      "SELECT * FROM submissions WHERE id = $1",
      [submissionId]
    );

    if (submission.rows.length === 0) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const payload = submission.rows[0].payload_json;

    // Create event from submission
    const slug = payload.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    await db.query(
      `INSERT INTO events (
        title, slug, description, start_at, end_at, city, address_text,
        category, tags, price_min, price_max, currency, image_url, ticket_url,
        adult_only, status, created_by_user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'published', $16)
      ON CONFLICT (slug) DO NOTHING`,
      [
        payload.title,
        slug,
        payload.description || null,
        payload.startAt,
        payload.endAt || null,
        payload.city,
        payload.address || null,
        payload.category || null,
        payload.tags || null,
        payload.priceMin || null,
        payload.priceMax || null,
        payload.currency || "EUR",
        payload.imageUrl || null,
        payload.ticketUrl || null,
        payload.adultOnly || false,
        submission.rows[0].user_id,
      ]
    );

    // Update submission status
    await db.query(
      "UPDATE submissions SET status = 'approved' WHERE id = $1",
      [submissionId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Approve submission error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
