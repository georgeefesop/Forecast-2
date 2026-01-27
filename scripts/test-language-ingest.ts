
import { db } from '../lib/db/client';
import { SoldOutTicketBoxAdapter } from '../lib/ingest/sources/soldout-ticketbox';
import { normalizeEvent } from '../lib/ingest/normalize';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

async function testLanguageIngest() {
    console.log('Testing language ingestion from SoldOutTicketBox...');

    const adapter = new SoldOutTicketBoxAdapter();
    const stubs = await adapter.list();

    console.log(`Found ${stubs.length} events.`);

    // Pick a few events with different expected languages if possible
    const enEvent = stubs.find(s => s.url.includes('/lang/en'));
    const elEvent = stubs.find(s => s.url.includes('/lang/el') || s.url.includes('/lang/gr'));

    const samples = [enEvent, elEvent].filter(Boolean);

    for (const stub of samples) {
        if (!stub) continue;
        console.log(`\nProcessing: ${stub.url}`);

        // Test detection logic directly
        const detail = await adapter.detail(stub);
        console.log(`Detected Language: ${detail.language}`);

        // Verify against URL
        const expected = stub.url.includes('/lang/el') || stub.url.includes('/lang/gr') ? 'el' : 'en'; // Simple check
        if (detail.language !== expected && detail.language !== 'ru') {
            console.error(`MISMATCH! Expected ${expected} but got ${detail.language}`);
        } else {
            console.log('✅ Match');
        }
    }
}


testLanguageIngest();
