import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db/client";

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const time = searchParams.get("time") || "upcoming"; // Default to upcoming

        const timeCondition = time === "past"
            ? "AND e.start_at < NOW()"
            : "AND e.start_at >= NOW()";

        const query = `
      SELECT DISTINCT ON (e.id)
        e.*,
        v.name as venue_name,
        v.city as venue_city,
        COALESCE(ec.interested_count, 0) as interested_count,
        COALESCE(ec.going_count, 0) as going_count,
        COALESCE(ec.saves_count, 0) as saves_count
      FROM events e
      JOIN event_actions ea ON e.id = ea.event_id
      LEFT JOIN venues v ON e.venue_id = v.id
      LEFT JOIN event_counters ec ON e.id = ec.event_id
      WHERE ea.user_id = $1
      AND ea.type IN ('save', 'interested', 'going')
      ${timeCondition}
      ORDER BY e.id, e.start_at ${time === "past" ? "DESC" : "ASC"}
    `;

        const result = await db.query(query, [session.user.id]);

        return NextResponse.json({ events: result.rows });
    } catch (error: any) {
        console.error("Account events error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
