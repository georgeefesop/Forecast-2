import { config } from 'dotenv';
import { join } from 'path';
import { fetchWithRetry } from '../lib/ingest/utils';

config({ path: join(process.cwd(), '.env.local') });

async function debug() {
    try {
        const response = await fetchWithRetry('https://cyprusunderground.com.cy/');
        const html = await response.text();

        console.log('Searching for JSON data in script tags...');
        const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
        if (scripts) {
            for (const script of scripts) {
                if (script.includes('window.__INITIAL_STATE__') || script.includes('events') || script.includes('[{')) {
                    console.log('Potential data found in script:');
                    console.log(script.substring(0, 1000));
                }
            }
        }

        process.exit(0);
    } catch (e) {
        console.error('Debug failed:', e);
        process.exit(1);
    }
}

debug();
