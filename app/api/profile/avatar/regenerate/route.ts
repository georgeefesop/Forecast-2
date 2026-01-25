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

    // Store the seed in the database so we can use it for consistent generation
    // Update profile to use generated avatar (remove uploaded one, store seed)
    await db.query(
      `UPDATE profiles 
       SET avatar_url = NULL, avatar_source = 'generated', avatar_seed = $1
       WHERE user_id = $2`,
      [seed, session.user.id]
    );

    return NextResponse.json({ success: true, seed });
  } catch (error: any) {
    console.error("Avatar regenerate error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to regenerate avatar" },
      { status: 500 }
    );
  }
}
