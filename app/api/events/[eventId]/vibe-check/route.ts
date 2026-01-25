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

    const { crowd, music, queue, value, note } = await request.json();
    const { eventId } = await params;

    await db.query(
      `INSERT INTO vibe_checks (user_id, event_id, crowd, music, queue, value, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, event_id) 
       DO UPDATE SET crowd = $3, music = $4, queue = $5, value = $6, note = $7`,
      [session.user.id, eventId, crowd || null, music || null, queue || null, value || null, note || null]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Vibe check error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
