
import { db } from '../lib/db/client';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

async function clearLock() {
    await db.query(`UPDATE ingest_runs SET status = 'failed' WHERE status = 'running'`);
    console.log('Cleared locks.');
}

clearLock();
