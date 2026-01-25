
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { LimassolMunicipalityAdapter } from '../lib/ingest/sources/limassol-municipality';
import { runIngestion } from '../lib/ingest/orchestrator';

async function main() {
    console.log('Starting ingestion for Limassol Municipality...');
    const adapter = new LimassolMunicipalityAdapter();

    try {
        const result = await runIngestion([adapter]);
        console.log('Ingestion result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Ingestion failed:', error);
        process.exit(1);
    }
}

main().catch(console.error);
