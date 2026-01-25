
import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function main() {
    console.log('Deleting events from limassol_municipality...');
    const result = await sql.query(`
    DELETE FROM events 
    WHERE source_name = 'limassol_municipality'
    RETURNING id, title
  `);

    console.log(`Deleted ${result.rows.length} events.`);
}

main().catch(console.error);
