
import { CyprusUndergroundAdapter } from '../lib/ingest/sources/cyprus-underground';

async function main() {
    console.log('Testing CyprusUndergroundAdapter...');
    const adapter = new CyprusUndergroundAdapter();
    const list = await adapter.list();
    console.log(`Found ${list.length} items`);

    // Test first 5 items
    for (const stub of list.slice(0, 5)) {
        console.log(`--- Processing ${stub.title} ---`);
        try {
            const detail = await adapter.detail(stub);
            console.log(`City: ${detail.city}`);
            console.log(`Address: ${detail.address}`);
            console.log(`Venue: ${detail.venue?.name}`);
        } catch (e) {
            console.error('Error:', e);
        }
    }
}

main().catch(console.error);
