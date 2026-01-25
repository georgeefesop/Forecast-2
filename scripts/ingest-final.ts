
import { SoldOutTicketBoxAdapter } from '../lib/ingest/sources/soldout-ticketbox';
import { runIngestion } from '../lib/ingest/orchestrator-final';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

async function runLegacyIngest() {
    console.log('Running targeted ingest for SoldOutTicketBox...');
    const adapters = [new SoldOutTicketBoxAdapter()];
    await runIngestion(adapters);
    console.log('Targeted ingest complete.');
}

runLegacyIngest().catch(console.error);
