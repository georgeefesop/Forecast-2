import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type } = await request.json();
    const { eventId } = await params;

    if (!["save", "interested", "going"].includes(type)) {
      return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
    }

    // Check if action exists
    const existing = await db.query(
      "SELECT id FROM event_actions WHERE user_id = $1 AND event_id = $2 AND type = $3",
      [session.user.id, eventId, type]
    );

    let active = false;
    if (existing.rows.length > 0) {
      // Remove action
      await db.query(
        "DELETE FROM event_actions WHERE user_id = $1 AND event_id = $2 AND type = $3",
        [session.user.id, eventId, type]
      );
      active = false;
    } else {
      // Add action
      await db.query(
        "INSERT INTO event_actions (user_id, event_id, type) VALUES ($1, $2, $3)",
        [session.user.id, eventId, type]
      );
      active = true;
    }

    // Get updated unified count
    const counter = await db.query(
      `SELECT (COALESCE(interested_count, 0) + COALESCE(going_count, 0) + COALESCE(saves_count, 0)) as count
       FROM event_counters WHERE event_id = $1`,
      [eventId]
    );

    return NextResponse.json({
      active,
      count: counter.rows[0]?.count || 0,
    });
  } catch (error: any) {
    console.error("Event action error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
