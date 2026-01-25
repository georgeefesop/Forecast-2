
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Vercel/Neon often uses POSTGRES_URL. Polyfill if necessary.
if (!process.env.DATABASE_URL && process.env.POSTGRES_URL) {
    process.env.DATABASE_URL = process.env.POSTGRES_URL;
}

import { RialtoInterticketAdapter } from '../lib/ingest/sources/rialto-interticket';
import { runIngestion } from '../lib/ingest/orchestrator';

async function main() {
    console.log('Starting ingestion for Rialto Theatre...');
    const adapter = new RialtoInterticketAdapter();

    try {
        const result = await runIngestion([adapter]);
        console.log('Ingestion result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Ingestion failed:', error);
        process.exit(1);
    }
}

main().catch(console.error);
