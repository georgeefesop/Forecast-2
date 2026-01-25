import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db/client";

// GET - Get a single comment (for checking ownership, etc.)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; commentId: string }> }
) {
  try {
    const { eventId, commentId } = await params;

    let result;
    try {
      result = await db.query(
        `SELECT c.*, p.handle, p.avatar_url, p.avatar_source, p.avatar_seed, p.user_id
         FROM comments c
         JOIN profiles p ON c.user_id = p.user_id
         WHERE c.id = $1 AND c.event_id = $2 AND c.status = 'visible'`,
        [commentId, eventId]
      );
    } catch (error: any) {
      // If columns don't exist, select without them
      if (error.message?.includes('column') && error.message?.includes('does not exist')) {
        result = await db.query(
          `SELECT c.id, c.body, c.created_at, c.user_id, c.event_id, c.status,
                  p.handle, p.avatar_url, p.avatar_source, p.avatar_seed, p.user_id
           FROM comments c
           JOIN profiles p ON c.user_id = p.user_id
           WHERE c.id = $1 AND c.event_id = $2 AND c.status = 'visible'`,
          [commentId, eventId]
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

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const row = result.rows[0];
    return NextResponse.json({
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
    });
  } catch (error: any) {
    console.error("Get comment error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT/PATCH - Update a comment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; commentId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, commentId } = await params;
    const { body } = await request.json();

    if (!body || typeof body !== "string" || body.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment body is required" },
        { status: 400 }
      );
    }

    // Verify comment exists and belongs to user
    const commentCheck = await db.query(
      "SELECT user_id FROM comments WHERE id = $1 AND event_id = $2 AND status = 'visible'",
      [commentId, eventId]
    );

    if (commentCheck.rows.length === 0) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (commentCheck.rows[0].user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update comment - check if edited_at column exists first
    let result;
    try {
      // Try with edited_at and updated_at columns (if migration has been run)
      result = await db.query(
        `UPDATE comments 
         SET body = $1, edited_at = NOW(), updated_at = NOW()
         WHERE id = $2 AND event_id = $3
         RETURNING id, edited_at`,
        [body.trim(), commentId, eventId]
      );
    } catch (error: any) {
      // If columns don't exist, update without them
      if (error.message?.includes('column "edited_at" does not exist') || 
          error.message?.includes('column "updated_at" does not exist')) {
        result = await db.query(
          `UPDATE comments 
           SET body = $1
           WHERE id = $2 AND event_id = $3
           RETURNING id`,
          [body.trim(), commentId, eventId]
        );
      } else {
        throw error;
      }
    }

    return NextResponse.json({
      id: result.rows[0].id,
      edited_at: result.rows[0].edited_at || null,
    });
  } catch (error: any) {
    console.error("Update comment error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a comment (soft delete by setting status to 'hidden')
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; commentId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, commentId } = await params;

    // Verify comment exists and belongs to user
    const commentCheck = await db.query(
      "SELECT user_id FROM comments WHERE id = $1 AND event_id = $2",
      [commentId, eventId]
    );

    if (commentCheck.rows.length === 0) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (commentCheck.rows[0].user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft delete by setting status to 'hidden'
    try {
      // Try with updated_at column (if migration has been run)
      await db.query(
        "UPDATE comments SET status = 'hidden', updated_at = NOW() WHERE id = $1 AND event_id = $2",
        [commentId, eventId]
      );
    } catch (error: any) {
      // If column doesn't exist, update without it
      if (error.message?.includes('column "updated_at" does not exist')) {
        await db.query(
          "UPDATE comments SET status = 'hidden' WHERE id = $1 AND event_id = $2",
          [commentId, eventId]
        );
      } else {
        throw error;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete comment error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
