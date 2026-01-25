
import { db } from '../lib/db/client';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

async function debugEvent() {
    try {
        const result = await db.query(
            `SELECT id, title, image_size_kb, is_primary_occurrence, image_url, local_image_url 
           FROM events 
           WHERE title ILIKE '%Lords of the Sound%'`
        );
        console.log('Event Details:', result.rows);
    } catch (error) {
        console.error('Error querying event:', error);
    }
}

debugEvent();
