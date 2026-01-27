
import { db } from '../lib/db/client';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

async function debugEvents() {
    const slugs = ['ruslan-bely-immigracias', 'amphibia'];

    for (const slug of slugs) {
        // We need to find by slug, but we don't store slugs directly in the schema shown in normalize.ts 
        // derived external ID is usually used. 
        // Let's search by title similarity or just list all events to find them since there are few.
        // Actually, let's search where source_url contains the slug or similar

        const res = await db.query(`
            SELECT id, title, description, language, source_url 
            FROM events 
            WHERE source_url ILIKE $1 OR title ILIKE $2
        `, [`%${slug}%`, `%${slug}%`]);

        if (res.rows.length > 0) {
            console.log(`\n--- Event found for "${slug}" ---`);
            const e = res.rows[0];
            console.log(`Title: ${e.title}`);
            console.log(`Language: ${e.language}`);
            console.log(`Description Preview: ${e.description?.substring(0, 100)}...`);

            // Check chars
            const hasCyrillicTitle = /[а-яА-Я]/.test(e.title);
            const hasCyrillicDesc = /[а-яА-Я]/.test(e.description || '');
            console.log(`Has Cyrillic in Title: ${hasCyrillicTitle}`);
            console.log(`Has Cyrillic in Description: ${hasCyrillicDesc}`);
        } else {
            console.log(`\nNo event found for "${slug}"`);
        }
    }
    process.exit(0);
}

debugEvents();
