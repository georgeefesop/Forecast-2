import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

    // Try to select with new columns, fallback if they don't exist
    let result;
    try {
      result = await db.query(
        `SELECT c.*, p.handle, p.avatar_url, p.avatar_source, p.avatar_seed, p.user_id
         FROM comments c
         JOIN profiles p ON c.user_id = p.user_id
         WHERE c.event_id = $1 AND c.status = 'visible'
         ORDER BY c.created_at ASC`,
        [eventId]
      );
    } catch (error: any) {
      // If columns don't exist, select without them
      if (error.message?.includes('column') && error.message?.includes('does not exist')) {
        result = await db.query(
          `SELECT c.id, c.body, c.created_at, c.user_id, c.event_id, c.status,
                  p.handle, p.avatar_url, p.avatar_source, p.avatar_seed, p.user_id
           FROM comments c
           JOIN profiles p ON c.user_id = p.user_id
           WHERE c.event_id = $1 AND c.status = 'visible'
           ORDER BY c.created_at ASC`,
          [eventId]
        );
        // Add null values for missing columns
        result.rows = result.rows.map((row: any) => ({
          ...row,
          edited_at: null,
          parent_id: null,
          updated_at: null,
        }));
      } else {
        throw error;
      }
    }

    // Build comment tree structure
    const commentsMap = new Map();
    const rootComments: any[] = [];

    // First pass: create all comment objects
    result.rows.forEach((row) => {
      const comment = {
        id: row.id,
        body: row.body,
        created_at: row.created_at,
        edited_at: row.edited_at || null,
        parent_id: row.parent_id || null,
        user: {
          handle: row.handle,
          avatar_url: row.avatar_url,
          avatar_source: row.avatar_source,
          avatar_seed: row.avatar_seed,
          user_id: row.user_id,
        },
        replies: [],
      };
      commentsMap.set(row.id, comment);
    });

    // Second pass: build tree structure
    result.rows.forEach((row) => {
      const comment = commentsMap.get(row.id);
      if (row.parent_id) {
        const parent = commentsMap.get(row.parent_id);
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    return NextResponse.json(rootComments);
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

    const { body, parent_id } = await request.json();
    const { eventId } = await params;

    if (!body || typeof body !== "string" || body.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment body is required" },
        { status: 400 }
      );
    }

    // If parent_id is provided, verify it exists and belongs to the same event
    if (parent_id) {
      const parentCheck = await db.query(
        "SELECT id FROM comments WHERE id = $1 AND event_id = $2 AND status = 'visible'",
        [parent_id, eventId]
      );
      if (parentCheck.rows.length === 0) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }
    }

    const result = await db.query(
      "INSERT INTO comments (event_id, user_id, body, parent_id) VALUES ($1, $2, $3, $4) RETURNING id",
      [eventId, session.user.id, body.trim(), parent_id || null]
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
