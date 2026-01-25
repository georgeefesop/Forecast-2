import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await db.query(
      "SELECT * FROM notification_preferences WHERE user_id = $1",
      [session.user.id]
    );

    if (result.rows.length === 0) {
      // Create default preferences if they don't exist
      await db.query(
        `INSERT INTO notification_preferences (user_id) 
         VALUES ($1) 
         ON CONFLICT (user_id) DO NOTHING`,
        [session.user.id]
      );
      
      // Fetch again
      const newResult = await db.query(
        "SELECT * FROM notification_preferences WHERE user_id = $1",
        [session.user.id]
      );
      return NextResponse.json(newResult.rows[0] || {});
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("Notification preferences fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch notification preferences" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Build dynamic update query
    const allowedFields = [
      "email_event_reminders",
      "email_event_updates",
      "email_new_matching_events",
      "email_comments",
      "email_comment_replies",
      "email_going_notifications",
      "email_submission_updates",
      "email_claim_updates",
      "email_security_alerts",
      "email_newsletter",
      "email_weekly_digest",
      "email_featured_events",
      "digest_frequency",
    ];

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (field in body) {
        updates.push(`${field} = $${paramIndex}`);
        values.push(body[field]);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    // Validate digest_frequency if provided
    if (body.digest_frequency && !["daily", "weekly", "never"].includes(body.digest_frequency)) {
      return NextResponse.json(
        { error: "Invalid digest_frequency value" },
        { status: 400 }
      );
    }

    // Ensure preferences exist first
    await db.query(
      `INSERT INTO notification_preferences (user_id) 
       VALUES ($1) 
       ON CONFLICT (user_id) DO NOTHING`,
      [session.user.id]
    );

    // Update what's provided
    const setClause = updates.join(", ");
    values.push(session.user.id);
    
    await db.query(
      `UPDATE notification_preferences 
       SET ${setClause}
       WHERE user_id = $${paramIndex}`,
      values
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Notification preferences update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update notification preferences" },
      { status: 500 }
    );
  }
}
