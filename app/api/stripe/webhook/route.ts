import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";

// Placeholder for Stripe webhook handler
// TODO: Implement when ready to add payments

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const sig = request.headers.get('stripe-signature');
    // const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    // TODO: Handle payment success events
    // if (event.type === 'checkout.session.completed') {
    //   const session = event.data.object;
    //   await db.query('UPDATE campaigns SET status = $1 WHERE id = $2', ['active', session.metadata.campaignId]);
    // }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
