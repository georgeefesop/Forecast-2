
import { db } from '../lib/db/client';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

// Deterministic assignments for null types
const KEYWORDS: Record<string, string> = {
    'club': 'Club',
    'bar': 'Bar',
    'theatre': 'Theatre',
    'theater': 'Theatre',
    'gallery': 'Gallery',
    'restaurant': 'Restaurant',
    'park': 'Festival Site',
    'stadium': 'Festival Site',
    'hall': 'Community',
    'center': 'Community',
    'centre': 'Community',
    'museum': 'Gallery',
    'cafe': 'Bar',
    'coffee': 'Bar',
    'hotel': 'Other',
};

async function assignTypes() {
    console.log('Fetching venues with null type...');
    const res = await db.query("SELECT id, name, about, short_description FROM venues WHERE type IS NULL");

    const venues = res.rows;
    console.log(`Found ${venues.length} venues to classify.`);

    let updated = 0;

    for (const v of venues) {
        let assignedType = 'Other';
        const text = (v.name + " " + (v.short_description || "") + " " + (v.about || "")).toLowerCase();

        for (const [key, type] of Object.entries(KEYWORDS)) {
            if (text.includes(key)) {
                assignedType = type;
                break;
            }
        }

        // Special cases based on name logic if needed, but keyword search is a good start.
        // If name is very short or generic and no match, it stays 'Other'.

        // Update DB
        await db.query("UPDATE venues SET type = $1 WHERE id = $2", [assignedType, v.id]);
        updated++;
        process.stdout.write(`\rUpdated ${updated}/${venues.length}`);
    }

    console.log('\nDone.');
    process.exit(0);
}

assignTypes().catch(err => {
    console.error(err);
    process.exit(1);
});
