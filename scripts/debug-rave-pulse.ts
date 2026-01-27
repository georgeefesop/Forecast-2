import { config } from 'dotenv';
import { join } from 'path';
import { RavePulseAdapter } from '../lib/ingest/sources/rave-pulse';

config({ path: join(process.cwd(), '.env.local') });

async function debug() {
    const adapter = new RavePulseAdapter();
    try {
        console.log('Listing stubs...');
        const stubs = await adapter.list();
        console.log(`Found ${stubs.length} stubs.`);
        if (stubs.length > 0) {
            console.log('Fetching detail for first stub:', stubs[0].url);
            const detail = await adapter.detail(stubs[0]);
            console.log('Detail:', JSON.stringify(detail, null, 2));
        }
        process.exit(0);
    } catch (e) {
        console.error('Debug failed:', e);
        process.exit(1);
    }
}

debug();
