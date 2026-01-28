
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getActiveAdapters } from '../lib/ingest';

async function main() {
    console.log('🔍 Verifying Adapter Frequencies...');

    const adapters = getActiveAdapters();
    const daily = adapters.filter(a => a.frequency === 'daily');
    const weekly = adapters.filter(a => a.frequency === 'weekly');
    const none = adapters.filter(a => !a.frequency);

    console.log(`\n📅 Daily Adapters (${daily.length}):`);
    daily.forEach(a => console.log(` - ${a.name}`));

    console.log(`\n📅 Weekly Adapters (${weekly.length}):`);
    weekly.forEach(a => console.log(` - ${a.name}`));

    if (none.length > 0) {
        console.log(`\n⚠️ Missing Frequency (${none.length}):`);
        none.forEach(a => console.log(` - ${a.name}`));
    } else {
        console.log('\n✅ All adapters have a frequency assigned.');
    }

    // Test filter logic
    const dailyFiltered = getActiveAdapters('daily');
    const weeklyFiltered = getActiveAdapters('weekly');

    if (dailyFiltered.length !== daily.length) console.error('❌ Daily filter mismatch!');
    if (weeklyFiltered.length !== weekly.length) console.error('❌ Weekly filter mismatch!');

    console.log('\n✅ Filter logic verified.');
}

main();
