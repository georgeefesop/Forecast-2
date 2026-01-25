import { config } from 'dotenv';
import { join } from 'path';
import { getActiveAdapters, runIngestion } from '../lib/ingest';

config({ path: join(process.cwd(), '.env.local') });

async function run() {
    try {
        const results = await runIngestion(getActiveAdapters());
        console.log('Ingestion Complete:', JSON.stringify(results, null, 2));
        process.exit(0);
    } catch (e) {
        console.error('Ingestion Failed:', e);
        process.exit(1);
    }
}

run();
