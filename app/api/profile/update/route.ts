import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db/client";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { handle } = await request.json();

    if (!handle || typeof handle !== "string") {
      return NextResponse.json(
        { error: "Handle is required" },
        { status: 400 }
      );
    }

    if (handle.length < 3 || handle.length > 20) {
      return NextResponse.json(
        { error: "Handle must be between 3 and 20 characters" },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_]+$/.test(handle)) {
      return NextResponse.json(
        { error: "Handle can only contain letters, numbers, and underscores" },
        { status: 400 }
      );
    }

    // Check if handle is taken
    const existing = await db.query(
      "SELECT user_id FROM profiles WHERE handle = $1 AND user_id != $2",
      [handle, session.user.id]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "Handle is already taken" },
        { status: 409 }
      );
    }

    // Update profile
    await db.query(
      "UPDATE profiles SET handle = $1 WHERE user_id = $2",
      [handle, session.user.id]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
