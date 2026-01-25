import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db/client";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Create campaign
    const campaignResult = await db.query(
      `INSERT INTO campaigns (
        owner_user_id, product_type, status, starts_at, ends_at,
        targeting_json, creative_json
      ) VALUES ($1, $2, 'pending_payment', $3, $4, $5, $6)
      RETURNING id`,
      [
        session.user.id,
        data.productType,
        data.startsAt || null,
        data.endsAt || null,
        JSON.stringify({
          city: data.city || null,
          category: data.category || null,
        }),
        JSON.stringify({
          headline: data.headline,
          description: data.description,
          ctaText: data.ctaText || "Learn More",
          ctaLink: data.ctaLink,
          imageUrl: data.imageUrl,
          eventId: data.eventId || null,
          venueId: data.venueId || null,
        }),
      ]
    );

    const campaignId = campaignResult.rows[0].id;

    // Create placements
    for (const placementType of data.placements || []) {
      await db.query(
        `INSERT INTO placements (campaign_id, placement_type, config_json)
         VALUES ($1, $2, $3)`,
        [campaignId, placementType, JSON.stringify({})]
      );
    }

    return NextResponse.json({ success: true, campaignId });
  } catch (error: any) {
    console.error("Create campaign error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
