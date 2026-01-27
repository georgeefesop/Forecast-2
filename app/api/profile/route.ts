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
      `SELECT 
        user_id,
        handle,
        email,
        avatar_url,
        avatar_source,
        avatar_seed,
        birthday,
        gender,
        age_verified,
        is_admin,
        is_organizer,
        created_at
       FROM profiles 
       WHERE user_id = $1`,
      [session.user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch profile" },
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
    const { birthday } = body;

    if (birthday) {
      // Validate date
      const date = new Date(birthday);
      if (isNaN(date.getTime())) {
        return NextResponse.json({ error: "Invalid date" }, { status: 400 });
      }

      // Calculate age
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();
      const isAdult = age > 18 || (age === 18 && monthDiff >= 0 && today.getDate() >= date.getDate());

      await db.query(
        `UPDATE profiles 
         SET birthday = $1, age_verified = $2
         WHERE user_id = $3`,
        [birthday, isAdult, session.user.id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
