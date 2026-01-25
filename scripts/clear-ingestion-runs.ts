
import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function main() {
    console.log('Clearing stuck ingestion runs...');
    // Delete running ingestions to reset state
    const result = await sql.query(`
    DELETE FROM ingest_runs
    WHERE status = 'running'
  `);

    console.log(`Deleted ${result.rowCount} running/stuck runs.`);
}

main().catch(console.error);
