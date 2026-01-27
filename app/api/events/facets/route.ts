import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const viewerId = searchParams.get("viewerId"); // Optional, for future use

    // Common WHERE clause for valid events
    // We only count primary occurrences that are published
    const baseWhere = `
      status = 'published' 
      AND (is_primary_occurrence = TRUE)
    `;

    // 1. City Counts
    const cityQuery = `
      SELECT city, COUNT(*) as cnt
      FROM events
      WHERE ${baseWhere} AND city IS NOT NULL AND start_at >= NOW()
      GROUP BY city
      ORDER BY cnt DESC
    `;

    // 2. Language Counts
    const languageQuery = `
      SELECT language, COUNT(*) as cnt
      FROM events
      WHERE ${baseWhere} AND language IS NOT NULL AND start_at >= NOW()
      GROUP BY language
      ORDER BY cnt DESC
    `;

    // 3. Source Counts
    const sourceQuery = `
      SELECT source_name, COUNT(*) as cnt
      FROM events
      WHERE status = 'published' 
        AND (is_primary_occurrence = TRUE)
        AND start_at >= NOW()
        AND source_name IS NOT NULL
      GROUP BY source_name
      ORDER BY cnt DESC
    `;

    // 4. Date Buckets
    // Matching logic in lib/db/queries/events.ts
    const dateQuery = `
      SELECT
        COUNT(*) FILTER (WHERE DATE(start_at) = CURRENT_DATE) as count_today,
        COUNT(*) FILTER (
          WHERE start_at >= CURRENT_DATE 
          AND start_at < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
          AND EXTRACT(DOW FROM start_at) IN (5, 6, 0)
        ) as count_weekend,
        COUNT(*) FILTER (
          WHERE start_at >= CURRENT_DATE 
          AND start_at < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
        ) as count_week,
        COUNT(*) FILTER (
          WHERE start_at >= CURRENT_DATE 
          AND start_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
        ) as count_month,
        COUNT(*) FILTER (WHERE start_at < NOW()) as count_past
      FROM events
      WHERE ${baseWhere}
    `;

    // 5. Venue Counts
    const venueQuery = `
      SELECT v.name as venue_name, v.slug as venue_slug, COUNT(*) as cnt
      FROM events e
      JOIN venues v ON e.venue_id = v.id
      WHERE ${baseWhere.replace(/status/g, 'e.status').replace(/is_primary_occurrence/g, 'e.is_primary_occurrence')} 
        AND e.start_at >= NOW()
      GROUP BY v.name, v.slug
      ORDER BY cnt DESC
      LIMIT 20
    `;

    const [cityRes, langRes, sourceRes, dateRes, venueRes] = await Promise.all([
      db.query(cityQuery),
      db.query(languageQuery),
      db.query(sourceQuery),
      db.query(dateQuery),
      db.query(venueQuery)
    ]);

    // Format Data
    const formattedCity = cityRes.rows.map(r => ({ value: r.city, count: parseInt(r.cnt) }));
    const formattedLang = langRes.rows.map(r => ({ value: r.language, count: parseInt(r.cnt) }));
    const formattedSource = sourceRes.rows.map(r => ({ value: r.source_name, count: parseInt(r.cnt) }));
    const formattedVenue = venueRes.rows.map(r => ({ value: r.venue_slug, label: r.venue_name, count: parseInt(r.cnt) }));

    // Format Dates
    const d = dateRes.rows[0];
    return NextResponse.json({
      cities: formattedCity,
      languages: formattedLang,
      sources: formattedSource,
      venues: formattedVenue,
      dates: [
        { value: "today", count: parseInt(d.count_today) },
        { value: "weekend", count: parseInt(d.count_weekend) },
        { value: "week", count: parseInt(d.count_week) },
        { value: "month", count: parseInt(d.count_month) },
        { value: "past", count: parseInt(d.count_past) },
      ]
    });

  } catch (error: any) {
    console.error("Facets fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
