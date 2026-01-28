
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from '../lib/db/client';
import { normalizeVenueName } from '../lib/ingest/utils';

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

async function main() {
    console.log('🔄 Starting Venue Cleanup (Phase 2: Renaming)...');

    // 1. Fetch all venues
    const res = await db.query('SELECT id, name, city, slug FROM venues');
    const venues = res.rows;
    console.log(`Loaded ${venues.length} venues.`);

    let renamedCount = 0;

    for (const v of venues) {
        const normalizedName = normalizeVenueName(v.name, v.city);

        // Check if name needs normalization
        if (v.name !== normalizedName) {
            // Skip if normalized name is empty or weird
            if (!normalizedName || normalizedName.length < 2) continue;

            console.log(`Checking "${v.name}" -> should be "${normalizedName}"`);

            const newSlug = slugify(`${normalizedName}-${v.city || 'cyprus'}`);

            // Update
            try {
                await db.query('UPDATE venues SET name = $1, slug = $2 WHERE id = $3', [normalizedName, newSlug, v.id]);
                console.log(`   ✅ Renamed to "${normalizedName}" (slug: ${newSlug})`);
                renamedCount++;
            } catch (e: any) {
                if (e.message.includes('unique constraint') || e.message.includes('slug_key')) {
                    console.warn(`   ⚠️ Skipping rename for "${v.name}": Slug "${newSlug}" already exists.`);
                } else {
                    console.error(`   ❌ Error renaming: ${e.message}`);
                }
            }
        }
    }

    console.log(`\n✅ Cleanup Complete.`);
    console.log(`   - Venues renamed: ${renamedCount}`);

    process.exit(0);
}

main();
