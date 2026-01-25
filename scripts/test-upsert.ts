
import { upsertEvent } from '../lib/ingest/orchestrator-debug';
import { db } from '../lib/db/client';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

async function test() {
    const dummyEvent = {
        title: 'Test Event Lords',
        startAt: new Date(),
        endAt: new Date(Date.now() + 3600000),
        city: 'Limassol',
        venue: { name: 'Rialto', city: 'Limassol', address: 'Test Addr' },
        address: 'Test Addr',
        category: 'Music',
        tags: ['Music'],
        priceMin: 10,
        priceMax: 20,
        currency: 'EUR',
        imageUrl: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
        ticketUrl: 'http://example.com',
        sourceName: 'test_source',
        sourceUrl: 'http://example.com/test-event',
        sourceExternalId: 'test-123',
        description: 'Test Desc',
        isHighRes: false,
        localImageUrl: null
    };

    try {
        // First, ensure event does or doesn't exist.
        // Let's create it first.
        console.log('Creating event...');
        await upsertEvent(dummyEvent as any);
        console.log('Event created.');

        // Now update it (simulate existing slug)
        console.log('Updating event...');
        await upsertEvent(dummyEvent as any);
        console.log('Event updated.');
    } catch (e) {
        console.error('Error:', e);
    }
}

test();
