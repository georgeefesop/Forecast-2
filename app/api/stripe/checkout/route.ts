import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";

// Placeholder for Stripe checkout integration
// TODO: Implement when ready to add payments

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { campaignId } = await request.json();

    // TODO: Create Stripe checkout session
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const session = await stripe.checkout.sessions.create({...});

    return NextResponse.json({
      error: "Stripe integration not yet implemented",
      campaignId,
    });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
