import { config } from 'dotenv';
import { join } from 'path';
import { fetchWithRetry } from '../lib/ingest/utils';

config({ path: join(process.cwd(), '.env.local') });

async function debug() {
    try {
        const url = 'https://rave-pulse.com/events/limassol/intl-at-mason/';
        const response = await fetchWithRetry(url);
        const html = await response.text();

        console.log('Sample detail page content (first 5000 chars):', html.substring(0, 5000));

        // Search for description-like tags
        if (html.includes('description')) console.log('Found "description"');
        if (html.includes('gt-content')) console.log('Found "gt-content"');
        if (html.includes('wp-block-post-content')) console.log('Found "wp-block-post-content"');

        process.exit(0);
    } catch (e) {
        console.error('Debug failed:', e);
        process.exit(1);
    }
}

debug();
