

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { ingestEvents } from '../lib/ingest';

/**
 * Script to run full ingestion manually or via cron
 * Runs all enabled adapters in lib/ingest/index.ts
 */
async function main() {
    console.log('🚀 Starting full ingestion...');
    const startTime = Date.now();

    try {
        const results = await ingestEvents();

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`\n✅ Ingestion completed in ${duration}s`);
        console.log('-----------------------------------');
        console.log(`Total Events Processed: ${results.total}`);
        console.log(`Created: ${results.created}`);
        console.log(`Updated: ${results.updated}`);
        console.log(`Errors: ${results.errors.length}`);

        if (results.errors.length > 0) {
            console.log('\n⚠️ Errors encountered:');
            results.errors.forEach(err => console.error(`- ${err}`));
        }

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Ingestion failed:', error);
        process.exit(1);
    }
}

main();
