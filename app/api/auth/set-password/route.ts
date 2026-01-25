import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db/client";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { password } = await request.json();

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Update profile
    await db.query(
      `UPDATE profiles 
       SET password_hash = $1, password_changed_at = NOW() 
       WHERE user_id = $2`,
      [passwordHash, session.user.id]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Set password error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to set password" },
      { status: 500 }
    );
  }
}
