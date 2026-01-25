import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db/client";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create deletion request (scheduled for 30 days from now for GDPR compliance)
    const scheduledDeletionAt = new Date();
    scheduledDeletionAt.setDate(scheduledDeletionAt.getDate() + 30);

    await db.query(
      `INSERT INTO account_deletion_requests (user_id, scheduled_deletion_at, status)
       VALUES ($1, $2, 'scheduled')
       ON CONFLICT (user_id) 
       DO UPDATE SET scheduled_deletion_at = $2, status = 'scheduled', requested_at = NOW()`,
      [session.user.id, scheduledDeletionAt]
    );

    // Note: Actual deletion will be handled by a scheduled job/cron
    // For now, we just mark it for deletion

    return NextResponse.json({ 
      success: true,
      message: "Account deletion scheduled. Your account will be deleted in 30 days."
    });
  } catch (error: any) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to schedule account deletion" },
      { status: 500 }
    );
  }
}
