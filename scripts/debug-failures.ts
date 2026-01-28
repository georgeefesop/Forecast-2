
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { RavePulseAdapter } from '../lib/ingest/sources/rave-pulse';

async function main() {
    console.log('--- Debugging Rave Pulse City Detection ---');

    // Test case 1: Limassol in URL
    const rpUrl = 'https://rave-pulse.com/events/limassol/disclosure-w-chris-bodnar-axel/';
    console.log(`Testing URL: ${rpUrl}`);

    const rpAdapter = new RavePulseAdapter();
    const detail = await rpAdapter.detail({
        url: rpUrl,
        title: 'Debug Event',
        dateHint: '2026-01-31',
        imageUrl: ''
    });

    console.log(`Detail Detected City: ${detail.city}`);

    const canonical = rpAdapter.mapToCanonical({
        ...detail,
        url: rpUrl,
        venue: detail.venue
    });

    console.log(`Canonical City: ${canonical.city}`);

    if (canonical.city === 'Limassol') {
        console.log('✅ SUCCESS: Detected Limassol from URL');
    } else {
        console.log('❌ FAILURE: Defaulted to ' + canonical.city);
    }
}

main().catch(console.error);
