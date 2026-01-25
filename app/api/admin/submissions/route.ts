import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await db.query(
      "SELECT * FROM submissions WHERE status = 'pending' ORDER BY created_at DESC"
    );

    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error("Get submissions error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
