
import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function main() {
    console.log('--- Debug Lock ---');

    const time = await sql.query('SELECT NOW() as db_time');
    console.log('DB Time:', time.rows[0].db_time);
    console.log('Local Time:', new Date().toISOString());

    const running = await sql.query(`
    SELECT id, status, started_at 
    FROM ingest_runs 
    WHERE status = 'running'
  `);

    console.log('Running jobs:', JSON.stringify(running.rows, null, 2));

    // Check the query acquireLock uses
    const lockQuery = await sql.query(`
    SELECT id, status, started_at 
    FROM ingest_runs 
    WHERE status = 'running' 
      AND started_at > NOW() - INTERVAL '1 hour'
    ORDER BY started_at DESC
  `);
    console.log('AcquireLock candidates:', JSON.stringify(lockQuery.rows, null, 2));
}

main().catch(console.error);
