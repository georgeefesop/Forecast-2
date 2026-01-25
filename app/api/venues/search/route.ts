import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    if (!query) {
      return NextResponse.json([]);
    }

    const result = await db.query(
      "SELECT * FROM venues WHERE name ILIKE $1 OR address ILIKE $1 ORDER BY name ASC LIMIT 20",
      [`%${query}%`]
    );

    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error("Venue search error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
