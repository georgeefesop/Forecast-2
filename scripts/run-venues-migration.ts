
import { db } from '../lib/db/client';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

// Load env vars
config({ path: join(process.cwd(), '.env.local') });

async function runMigration() {
    console.log('Running venues schema expansion migration...');

    // Read the SQL file
    const migrationPath = join(process.cwd(), 'lib/db/migrations/expand-venues-schema.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    try {
        await db.query(sql);
        console.log('Migration executed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        // We can't easily close the db pool here if it's imported from client, 
        // but process.exit will handle it.
    }

    process.exit(0);
}

runMigration().catch(err => {
    console.error(err);
    process.exit(1);
});
