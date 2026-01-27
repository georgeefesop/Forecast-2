'use server';

import { auth } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db/client";
import { revalidatePath } from "next/cache";

export type ClaimState = {
    message?: string;
    error?: string;
    success?: boolean;
};

export async function submitVenueClaim(prevState: ClaimState, formData: FormData): Promise<ClaimState> {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "You must be logged in to claim a venue." };
    }

    const venueId = formData.get("venueId") as string;
    const role = formData.get("role") as string;
    const website = formData.get("website") as string;
    const instagram = formData.get("instagram") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const notes = formData.get("notes") as string;

    if (!venueId || !role) {
        return { error: "Venue ID and Role are required." };
    }

    try {
        // Check if pending claim exists
        const existing = await db.query(
            `SELECT id FROM venue_claims WHERE venue_id = $1 AND user_id = $2 AND status = 'pending'`,
            [venueId, session.user.id]
        );

        if (existing.rows.length > 0) {
            return { error: "You already have a pending claim for this venue." };
        }

        // Insert claim
        await db.query(
            `INSERT INTO venue_claims (venue_id, user_id, role, contact_info, admin_notes)
       VALUES ($1, $2, $3, $4, $5)`,
            [
                venueId,
                session.user.id,
                role,
                JSON.stringify({ website, instagram, email, phone }),
                notes
            ]
        );

        // Update venue status to pending if it was unclaimed? 
        // Usually we keep venue as 'unclaimed' until claim is APPROVED.
        // The user spec says "Submit claim -> status becomes pending".
        // Does this mean venue.claim_status? Or claim.status?
        // "Submit claim -> status becomes pending" usually refers to the claim itself.
        // But "Claim this venue" button appears when claim_status = unclaimed.
        // Ideally we update venue.claim_status to 'pending' to prevent multiple claims? 
        // Or allow multiple and admin chooses one?
        // Spec D2: "Submit claim -> status becomes pending" (Claims object).
        // Spec D3: "status: pending / approved / rejected".
        // Spec A1: "claim_status (unclaimed | pending | verified | rejected)".
        // Maybe we update venue too.

        await db.query(
            `UPDATE venues SET claim_status = 'pending' WHERE id = $1 AND claim_status = 'unclaimed'`,
            [venueId]
        );

        revalidatePath(`/venue/[slug]`); // We don't have slug here easily, but can try

        return { success: true, message: "Claim submitted successfully! We will review your request shortly." };
    } catch (error) {
        console.error("Claim submission error:", error);
        return { error: "Failed to submit claim. Please try again." };
    }
}
