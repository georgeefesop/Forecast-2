
import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function main() {
    console.log('Deleting events from soldout_ticketbox...');
    const result = await sql.query(`
    DELETE FROM events 
    WHERE source_name = 'soldout_ticketbox'
  `);

    console.log(`Deleted ${result.rowCount} events.`);
}

main().catch(console.error);
