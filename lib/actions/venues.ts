'use server';

import { auth } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db/client";
import { revalidatePath } from "next/cache";
import { getVenueById } from "@/lib/db/queries/venues";

export type VenueUpdateState = {
    message?: string;
    error?: string;
    success?: boolean;
};

export async function updateVenue(venueId: string, prevState: VenueUpdateState, formData: FormData): Promise<VenueUpdateState> {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    // Authorization check
    // We fetch venue logic here again or assume caller checked?
    // Safer to check here.
    const venue = await getVenueById(venueId);
    if (!venue) return { error: "Venue not found" };

    const isAdmin = false; // TODO: Check admin role from profile/session
    // Ideally session.user.isAdmin if implemented
    // For now assuming only owner
    const isOwner = venue.claimed_by_user_id === session.user.id;

    // We should allow Admin to edit too.
    // Check profile table for is_admin?
    const profile = await db.query('SELECT is_admin FROM profiles WHERE user_id = $1', [session.user.id]);
    const isUserAdmin = profile.rows[0]?.is_admin;

    if (!isOwner && !isUserAdmin) {
        return { error: "You do not have permission to edit this venue." };
    }

    // Parse formData
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const short_description = formData.get("short_description") as string;
    const about = formData.get("about") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const area = formData.get("area") as string;
    const website_url = formData.get("website_url") as string;
    const instagram_url = formData.get("instagram_url") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    // Tags handling (comma separated string -> array)
    const tagsStr = formData.get("tags") as string;
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];

    // Images handling (newline or comma separated)
    const imagesText = formData.get("images_text") as string;
    const images = imagesText
        ? imagesText.split(/[\n,]+/).map(t => t.trim()).filter(Boolean)
        : null;

    // Validations (basic)
    if (!name || !city) {
        return { error: "Name and City are required." };
    }

    try {
        await db.query(`
            UPDATE venues SET
                name = $1,
                city = $2,
                area = $3,
                address = $4,
                type = $5,
                short_description = $6,
                about = $7,
                website_url = $8,
                instagram_url = $9,
                phone = $10,
                email = $11,
                tags = $12,
                images = $13,
                updated_at = NOW()
            WHERE id = $14
        `, [
            name, city, area, address, type, short_description, about,
            website_url, instagram_url, phone, email, tags, images, venueId
        ]);

        revalidatePath(`/venue/${venue.slug}`);
        revalidatePath(`/venues`);

        return { success: true, message: "Venue updated successfully." };
    } catch (error) {
        console.error("Update venue error:", error);
        return { error: "Failed to update venue." };
    }
}
