import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

    const result = await db.query(
      `SELECT c.*, p.handle, p.avatar_url
       FROM comments c
       JOIN profiles p ON c.user_id = p.user_id
       WHERE c.event_id = $1 AND c.status = 'visible'
       ORDER BY c.created_at DESC
       LIMIT 50`,
      [eventId]
    );

    const comments = result.rows.map((row) => ({
      id: row.id,
      body: row.body,
      created_at: row.created_at,
      user: {
        handle: row.handle,
        avatar_url: row.avatar_url,
      },
    }));

    return NextResponse.json(comments);
  } catch (error: any) {
    console.error("Get comments error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { body } = await request.json();
    const { eventId } = await params;

    if (!body || typeof body !== "string" || body.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment body is required" },
        { status: 400 }
      );
    }

    const result = await db.query(
      "INSERT INTO comments (event_id, user_id, body) VALUES ($1, $2, $3) RETURNING id",
      [eventId, session.user.id, body.trim()]
    );

    return NextResponse.json({ id: result.rows[0].id });
  } catch (error: any) {
    console.error("Post comment error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
