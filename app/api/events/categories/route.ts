import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export async function GET() {
  try {
    // Fetch distinct categories from upcoming events
    // We want all categories that are currently in use for future events
    // Also consider tags? User said "have our filter categories... auto-update"

    // Let's get unique categories from the 'category' column AND the 'tags' array
    // for events that are published and in the future (or recent past?)
    // Usually filters are for what's available NOW.

    const query = `
      WITH active_categories AS (
        SELECT category, COUNT(*) as cnt
        FROM events 
        WHERE status = 'published' AND start_at >= NOW() AND category IS NOT NULL
        GROUP BY category
      ),
      active_tags AS (
        SELECT unnest(tags) as tag, COUNT(*) as cnt
        FROM events
        WHERE status = 'published' AND start_at >= NOW() AND tags IS NOT NULL
        GROUP BY tag
      )
      SELECT category, SUM(cnt) as count 
      FROM (
        SELECT category, cnt FROM active_categories
        UNION ALL
        SELECT tag as category, cnt FROM active_tags
      ) as combined
      GROUP BY category
      ORDER BY count DESC
    `;

    const result = await db.query(query);
    const categories = result.rows
      .filter(r => r.category && r.category.length > 2)
      .map(r => ({
        name: r.category,
        count: parseInt(r.count)
      }));

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error("Categories fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
