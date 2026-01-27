
import { db } from '../lib/db/client';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

async function check() {
    try {
        const res = await db.query("SELECT type, count(*) as count FROM venues GROUP BY type ORDER BY count DESC");
        console.log('Venue Types:', res.rows);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

check();
