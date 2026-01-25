
import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";

/**
 * GET /api/events/map
 * Returns lightweight event/venue data for the map
 */
export async function GET() {
    try {
        // Join events with venues to get coordinates
        // Only future events
        // Prioritize event lat/lng over venue lat/lng if event has specific location
        const result = await db.query(`
      SELECT 
        e.id, 
        e.title, 
        e.slug,
        e.start_at,
        e.category,
        e.price_min,
        e.image_url,
        COALESCE(e.lat, v.lat) as lat,
        COALESCE(e.lng, v.lng) as lng,
        v.name as venue_name
      FROM events e
      LEFT JOIN venues v ON e.venue_id = v.id
      WHERE e.start_at >= NOW() 
        AND (e.lat IS NOT NULL OR v.lat IS NOT NULL)
      ORDER BY e.start_at ASC
    `);

        // Format for frontend
        const points = result.rows.map(row => ({
            id: row.id,
            type: "event",
            lat: parseFloat(row.lat),
            lng: parseFloat(row.lng),
            title: row.title,
            slug: row.slug,
            category: row.category,
            price: row.price_min, // Might be string from DB, frontend should handle or we cast
            date: row.start_at,
            venue: row.venue_name,
            image: row.image_url
        }));

        return NextResponse.json({ points });
    } catch (error: any) {
        console.error("Map data fetch error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
