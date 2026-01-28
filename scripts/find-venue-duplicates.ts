
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from '../lib/db/client';
import { normalizeVenueName } from '../lib/ingest/utils';

async function main() {
    console.log('🔍 Scanning for duplicate venues...');

    const res = await db.query('SELECT id, name, city, slug FROM venues');
    const venues = res.rows;
    console.log(`Loaded ${venues.length} venues.`);

    const groups: Record<string, typeof venues> = {};

    for (const v of venues) {
        const normalized = normalizeVenueName(v.name, v.city);
        // Create a key based on normalized name + city
        const key = `${normalized}|${v.city || 'Unknown'}`;

        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(v);
    }

    let duplicateCount = 0;
    for (const [key, group] of Object.entries(groups)) {
        if (group.length > 1) {
            duplicateCount++;
            const [name, city] = key.split('|');
            console.log(`\n⚠️ Potential Duplicate Group: "${name}" (${city})`);
            group.forEach(v => console.log(`   - [${v.id}] "${v.name}" (slug: ${v.slug})`));
        }
    }

    if (duplicateCount === 0) {
        console.log('\n✅ No duplicates found based on current normalization rules.');
    } else {
        console.log(`\nFound ${duplicateCount} groups of potential duplicates.`);
    }

    process.exit(0);
}

main();
