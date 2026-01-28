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
      WITH expanded_tags AS (
        SELECT id, category as label FROM events 
        WHERE status = 'published' AND start_at >= NOW() AND category IS NOT NULL AND is_primary_occurrence = TRUE
        UNION ALL
        SELECT id, unnest(tags) as label FROM events
        WHERE status = 'published' AND start_at >= NOW() AND tags IS NOT NULL AND is_primary_occurrence = TRUE
      )
      SELECT label as category, COUNT(DISTINCT id) as count
      FROM expanded_tags
      GROUP BY label
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
