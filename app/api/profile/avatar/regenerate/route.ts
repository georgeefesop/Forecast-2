import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db/client";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { seed } = await request.json();

    // Update profile to use generated avatar (remove uploaded one)
    await db.query(
      `UPDATE profiles 
       SET avatar_url = NULL, avatar_source = 'generated' 
       WHERE user_id = $1`,
      [session.user.id]
    );

    // Note: The actual avatar generation happens client-side using the seed
    // We just mark it as generated so it will use the new seed

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Avatar regenerate error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to regenerate avatar" },
      { status: 500 }
    );
  }
}
