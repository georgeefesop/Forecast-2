
import { SoldOutTicketBoxAdapter } from '../lib/ingest/sources/soldout-ticketbox';

async function main() {
    console.log('Testing SoldOut TicketBox Adapter...');
    const adapter = new SoldOutTicketBoxAdapter();

    try {
        const stubs = await adapter.list();
        console.log(`Found ${stubs.length} events.`);

        if (stubs.length > 0) {
            console.log('First 3 events:');
            stubs.slice(0, 3).forEach((stub, i) => {
                console.log(`\nEvent #${i + 1}:`);
                console.log(`Title: ${stub.title}`);
                console.log(`URL: ${stub.url}`);
                console.log(`DateHint: ${stub.dateHint}`);
            });
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
