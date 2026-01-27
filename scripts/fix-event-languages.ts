
import { config } from 'dotenv';
import { join } from 'path';

// Load env vars BEFORE importing db client which initializes connection
config({ path: join(process.cwd(), '.env.local') });

import { db } from '../lib/db/client';
import { normalizeEvent } from '../lib/ingest/normalize';

async function fixLanguages() {
    console.log('🚀 Starting Language Repair...');

    // 1. Fetch all events
    const events = await db.query(`
    SELECT id, title, description, language, source_url 
    FROM events
  `);

    console.log(`Found ${events.rows.length} events to check.`);

    let updatedCount = 0;
    let skippedCount = 0;

    // 2. Iterate and re-evaluate language
    for (const event of events.rows) {
        const title = event.title;
        const currentLang = event.language;

        const description = event.description || '';

        // Logic duplicated from normalize.ts
        let detectedLang = 'en';

        // 1. Title check
        if (/[α-ωΑ-Ω]/.test(title)) {
            detectedLang = 'el';
        } else if (/[а-яА-Я]/.test(title)) {
            detectedLang = 'ru';
        }
        // 2. Description check
        else if (/[α-ωΑ-Ω]/.test(description)) {
            detectedLang = 'el';
        } else if (/[а-яА-Я]/.test(description)) {
            detectedLang = 'ru';
        }
        else {
            detectedLang = 'en';
        }
        if (detectedLang !== currentLang) {
            console.log(`📝 Updating "${title.substring(0, 40)}..." from '${currentLang}' to '${detectedLang}'`);

            await db.query(`
                UPDATE events 
                SET language = $1 
                WHERE id = $2
            `, [detectedLang, event.id]);

            updatedCount++;
        } else {
            skippedCount++;
        }
    }

    console.log(`\n✅ Repair Complete!`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Skipped: ${skippedCount}`);

    process.exit(0);
}

fixLanguages().catch(err => {
    console.error(err);
    process.exit(1);
});
