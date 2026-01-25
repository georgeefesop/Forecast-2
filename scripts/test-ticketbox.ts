
import { TicketBoxAdapter } from '../lib/ingest/sources/ticketbox';

async function test() {
    const adapter = new TicketBoxAdapter();
    console.log('Testing TicketBox Adapter...');

    try {
        const list = await adapter.list();
        console.log(`Found ${list.length} items.`);

        if (list.length > 0) {
            console.log('Sample item:', list[0]);
            console.log('Fetching detail for first item...');
            const detail = await adapter.detail(list[0]);
            console.log('Detail:', detail);
        } else {
            // Debug: Print HTML structure hint if 0 found
            console.log('0 items found. You might need to adjust selectors.');
        }
    } catch (err) {
        console.error(err);
    }
}

test();
