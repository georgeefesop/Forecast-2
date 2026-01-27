'use server';

import { auth } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db/client';
import { revalidatePath } from 'next/cache';

export async function toggleSave(eventId: string, currentPath: string) {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "authentication_required" };
    }

    const userId = session.user.id;

    try {
        // Check if any "save-like" interaction exists (interested, going, or save)
        const existing = await db.query(
            `SELECT id, type FROM event_actions WHERE user_id = $1 AND event_id = $2 AND type IN ('save', 'interested', 'going')`,
            [userId, eventId]
        );

        if (existing.rows.length > 0) {
            // If it exists, remove it (Toggle OFF)
            // We remove ALL types to ensure unification
            await db.query(
                `DELETE FROM event_actions WHERE user_id = $1 AND event_id = $2 AND type IN ('save', 'interested', 'going')`,
                [userId, eventId]
            );

            revalidatePath(currentPath);
            return { status: 'removed' };
        } else {
            // Add it (Toggle ON) - always use 'save' now
            await db.query(
                `INSERT INTO event_actions (user_id, event_id, type) VALUES ($1, $2, 'save')
         ON CONFLICT (user_id, event_id, type) DO NOTHING`,
                [userId, eventId]
            );

            revalidatePath(currentPath);
            return { status: 'added' };
        }
    } catch (error) {
        console.error('Error toggling save:', error);
        return { error: "database_error" };
    }
}
