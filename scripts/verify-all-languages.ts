
import { config } from 'dotenv';
import { join } from 'path';
import { SoldOutTicketBoxAdapter } from '../lib/ingest/sources/soldout-ticketbox';
import { TicketBoxAdapter } from '../lib/ingest/sources/ticketbox';
import { RialtoInterticketAdapter } from '../lib/ingest/sources/rialto-interticket';
import { LimassolMunicipalityAdapter } from '../lib/ingest/sources/limassol-municipality';
import { AllAboutLimassolAdapter } from '../lib/ingest/sources/all-about-limassol';
import { LimassolMarinaAdapter } from '../lib/ingest/sources/limassol-marina';
import { LimassolTourismAdapter } from '../lib/ingest/sources/limassol-tourism';
import { MoreAdapter } from '../lib/ingest/sources/more';

config({ path: join(process.cwd(), '.env.local') });

const adapters = [
    new SoldOutTicketBoxAdapter(),
    new TicketBoxAdapter(),
    new RialtoInterticketAdapter(),
    new LimassolMunicipalityAdapter(),
    new AllAboutLimassolAdapter(),
    new LimassolMarinaAdapter(),
    new LimassolTourismAdapter(),
    new MoreAdapter()
];

async function verifyLanguages() {
    console.log('🚀 Starting Language Verification for All Adapters...\n');

    for (const adapter of adapters) {
        console.log(`\n---------------------------------------------------------`);
        console.log(`📡 Testing Adapter: ${adapter.name}`);
        console.log(`---------------------------------------------------------`);

        try {
            // Fetch a few stubs
            const stubs = await adapter.list();
            console.log(`Found ${stubs.length} events in list.`);

            if (stubs.length === 0) {
                console.warn('⚠️ No events found for this adapter.');
                continue;
            }

            // Test first 3-5 events
            const samples = stubs.slice(0, 3);

            for (const stub of samples) {
                try {
                    console.log(`\n  Checking: ${stub.title.substring(0, 50)}...`);
                    console.log(`  URL: ${stub.url}`);

                    const detail = await adapter.detail(stub);
                    console.log(`  ✅ Detected Language: '${detail.language}'`);

                    if (!detail.language) {
                        console.error(`  ❌ ERROR: No language detected!`);
                    }
                } catch (err: any) {
                    console.error(`  ❌ Error fetching detail: ${err.message}`);
                }
            }

        } catch (err: any) {
            console.error(`❌ Error listing events: ${err.message}`);
        }
    }

    console.log('\n---------------------------------------------------------');
    console.log('✨ Verification Complete');
}

verifyLanguages();
