import { config } from 'dotenv';
import { join } from 'path';
import { fetchWithRetry } from '../lib/ingest/utils';
import { load } from 'cheerio';

config({ path: join(process.cwd(), '.env.local') });

async function debug() {
    try {
        const response = await fetchWithRetry('https://rave-pulse.com/events/');
        const html = await response.text();
        const $ = load(html);

        console.log('Testing .gt-event-style-3 selector...');
        const items = $('.gt-event-style-3');
        console.log(`Found ${items.length} items.`);

        if (items.length > 0) {
            const first = items.first();
            console.log('First item title:', first.find('.gt-title').text().trim());
            console.log('First item link:', first.find('a').attr('href'));
            console.log('First item date:', first.find('.gt-date').text().trim());
            console.log('First item venue:', first.find('.gt-venue').text().trim());
        }

        process.exit(0);
    } catch (e) {
        console.error('Debug failed:', e);
        process.exit(1);
    }
}

debug();
