import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const existing = await db.query(
      "SELECT id FROM newsletter_subscribers WHERE email = $1",
      [data.email]
    );

    if (existing.rows.length > 0) {
      // Update existing subscription
      await db.query(
        `UPDATE newsletter_subscribers SET
         phone = $1, city = $2, interests = $3, frequency = $4, status = 'active'
         WHERE email = $5`,
        [
          data.phone || null,
          data.city,
          data.interests || [],
          data.frequency,
          data.email,
        ]
      );
    } else {
      // Create new subscription
      await db.query(
        `INSERT INTO newsletter_subscribers (email, phone, city, interests, frequency, status)
         VALUES ($1, $2, $3, $4, $5, 'active')`,
        [
          data.email,
          data.phone || null,
          data.city,
          data.interests || [],
          data.frequency,
        ]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
