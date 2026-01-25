
import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function main() {
    console.log('--- Debug Ingest Runs ---');

    const time = await sql.query('SELECT NOW()');
    console.log('DB Time:', time.rows[0].now);

    const active = await sql.query(`
    SELECT * FROM ingest_runs 
    WHERE status NOT IN ('completed', 'failed')
  `);
    console.log('Active Runs:', JSON.stringify(active.rows, null, 2));

    const recent = await sql.query(`
    SELECT * FROM ingest_runs 
    ORDER BY started_at DESC LIMIT 5
  `);
    console.log('Recent Runs:', JSON.stringify(recent.rows, null, 2));
}

main().catch(console.error);
