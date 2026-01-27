'use server';

import { auth } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db/client';
import { revalidatePath } from 'next/cache';

export async function toggleInterest(eventId: string, currentPath: string) {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "authentication_required" };
    }

    const userId = session.user.id;

    try {
        // Check if interaction exists
        const existing = await db.query(
            `SELECT id FROM event_actions WHERE user_id = $1 AND event_id = $2 AND type = 'interested'`,
            [userId, eventId]
        );

        if (existing.rows.length > 0) {
            // Remove it (Toggle OFF)
            await db.query(
                `DELETE FROM event_actions WHERE user_id = $1 AND event_id = $2 AND type = 'interested'`,
                [userId, eventId]
            );

            // Also potentially check if 'going' exists and remove it? 
            // User said "Hide 'going' lets just have 'interested'".
            // Best to keep it simple for now. 

            revalidatePath(currentPath);
            return { status: 'removed' };
        } else {
            // Add it (Toggle ON)
            await db.query(
                `INSERT INTO event_actions (user_id, event_id, type) VALUES ($1, $2, 'interested')
         ON CONFLICT (user_id, event_id, type) DO NOTHING`,
                [userId, eventId]
            );

            revalidatePath(currentPath);
            return { status: 'added' };
        }
    } catch (error) {
        console.error('Error toggling interest:', error);
        return { error: "database_error" };
    }
}
