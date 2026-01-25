import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await db.query(
      `SELECT 
        show_going_publicly,
        show_profile_publicly,
        show_activity_publicly,
        show_comments_publicly,
        show_email_publicly,
        allow_direct_messages,
        show_location_publicly,
        profile_visibility,
        share_analytics_data
       FROM profiles 
       WHERE user_id = $1`,
      [session.user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("Privacy settings fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch privacy settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      show_going_publicly,
      show_profile_publicly,
      show_activity_publicly,
      show_comments_publicly,
      show_email_publicly,
      allow_direct_messages,
      show_location_publicly,
      profile_visibility,
      share_analytics_data,
    } = body;

    // Validate profile_visibility
    if (profile_visibility && !["public", "unlisted", "private"].includes(profile_visibility)) {
      return NextResponse.json(
        { error: "Invalid profile_visibility value" },
        { status: 400 }
      );
    }

    await db.query(
      `UPDATE profiles SET
        show_going_publicly = COALESCE($1, show_going_publicly),
        show_profile_publicly = COALESCE($2, show_profile_publicly),
        show_activity_publicly = COALESCE($3, show_activity_publicly),
        show_comments_publicly = COALESCE($4, show_comments_publicly),
        show_email_publicly = COALESCE($5, show_email_publicly),
        allow_direct_messages = COALESCE($6, allow_direct_messages),
        show_location_publicly = COALESCE($7, show_location_publicly),
        profile_visibility = COALESCE($8, profile_visibility),
        share_analytics_data = COALESCE($9, share_analytics_data)
       WHERE user_id = $10`,
      [
        show_going_publicly,
        show_profile_publicly,
        show_activity_publicly,
        show_comments_publicly,
        show_email_publicly,
        allow_direct_messages,
        show_location_publicly,
        profile_visibility,
        share_analytics_data,
        session.user.id,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Privacy settings update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update privacy settings" },
      { status: 500 }
    );
  }
}
