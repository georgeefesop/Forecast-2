import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db/client";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { venueId } = await request.json();

    if (!venueId) {
      return NextResponse.json(
        { error: "Venue ID is required" },
        { status: 400 }
      );
    }

    // Check if venue exists and is unclaimed
    const venue = await db.query(
      "SELECT claim_status FROM venues WHERE id = $1",
      [venueId]
    );

    if (venue.rows.length === 0) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    if (venue.rows[0].claim_status !== "unclaimed") {
      return NextResponse.json(
        { error: "Venue is already claimed or pending" },
        { status: 409 }
      );
    }

    // Update venue claim status
    await db.query(
      "UPDATE venues SET claim_status = 'pending', claimed_by_user_id = $1 WHERE id = $2",
      [session.user.id, venueId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Claim venue error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
