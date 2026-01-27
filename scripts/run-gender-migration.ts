
import { db } from '../lib/db/client';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

config({ path: join(process.cwd(), '.env.local') });

async function runMigration() {
    console.log('Running migration...');
    const sql = readFileSync(join(process.cwd(), 'lib/db/migrations/add-gender-to-profiles.sql'), 'utf-8');
    await db.query(sql);
    console.log('Migration complete!');
    process.exit(0);
}

runMigration().catch(err => {
    console.error(err);
    process.exit(1);
});
