
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { NicosiaForArtAdapter } from '../lib/ingest/sources/nicosia-for-art';

async function main() {
    console.log('--- Testing Nicosia For Art Only (Final Check) ---');

    console.log('\n--- Testing Nicosia For Art ---');
    const nicosia = new NicosiaForArtAdapter();
    try {
        const events = await nicosia.list();
        console.log(`[Nicosia] Found ${events.length} events.`);
        if (events.length > 0) {
            console.log(`[Nicosia] Sample URL: ${events[0].url}`);
            const detail = await nicosia.detail(events[0]);
            console.log('[Nicosia] Sample Detail:', {
                title: detail.title,
                date: detail.startAt,
                location: detail.venue?.name,
                city: detail.city
            });
        }
    } catch (e: any) { console.error('[Nicosia] Error:', e.message); }
}

main().catch(console.error);
