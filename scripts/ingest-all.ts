
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { ingestEvents, getActiveAdapters } from '../lib/ingest';
import { runIngestion } from '../lib/ingest/orchestrator';

/**
 * Script to run ingestion manually or via cron
 * Usage: 
 *  npx tsx scripts/ingest-all.ts                  (Run all)
 *  npx tsx scripts/ingest-all.ts --source=nicosia (Run specific source by partial name match)
 */
async function main() {
    console.log('🚀 Starting ingestion...');
    const startTime = Date.now();

    // Parse arguments
    const args = process.argv.slice(2);
    const sourceArg = args.find(a => a.startsWith('--source=') || a.startsWith('-s='));
    const targetSource = sourceArg ? sourceArg.split('=')[1].toLowerCase() : null;

    const frequencyArg = args.find(a => a.startsWith('--frequency=') || a.startsWith('-f='));
    const targetFrequency = frequencyArg ? frequencyArg.split('=')[1].toLowerCase() : null;

    try {
        let results;

        if (targetSource) {
            console.log(`🎯 Targeting source(s) matching: "${targetSource}"`);
            const allAdapters = getActiveAdapters();
            const filteredAdapters = allAdapters.filter(a => a.name.toLowerCase().includes(targetSource));

            if (filteredAdapters.length === 0) {
                console.error(`❌ No adapters found matching "${targetSource}"`);
                console.log('Available adapters:', allAdapters.map(a => a.name).join(', '));
                process.exit(1);
            }

            console.log(`📋 Running adapters: ${filteredAdapters.map(a => a.name).join(', ')}`);
            results = await runIngestion(filteredAdapters);
        } else if (targetFrequency) {
            console.log(`⏱️ Filtering by frequency: "${targetFrequency}"`);

            // Validate frequency
            if (targetFrequency !== 'daily' && targetFrequency !== 'weekly') {
                console.error(`❌ Invalid frequency "${targetFrequency}". Must be "daily" or "weekly"`);
                process.exit(1);
            }

            const adapters = getActiveAdapters(targetFrequency as any);

            if (adapters.length === 0) {
                console.error(`❌ No adapters found for frequency "${targetFrequency}"`);
                process.exit(1);
            }

            console.log(`📋 Running adapters: ${adapters.map(a => a.name).join(', ')}`);
            results = await runIngestion(adapters);
        } else {
            // Run all
            results = await ingestEvents();
        }

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
