const { readFileSync } = require('fs');
const { join } = require('path');
const { config } = require('dotenv');
const { sql } = require('@vercel/postgres');

config({ path: join(process.cwd(), '.env.local') });

async function migrate() {
    try {
        console.log('🔄 Starting aesthetic v2 migration...');
        const migrationPath = join(process.cwd(), 'lib/db/migrations/add-aesthetic-v2.sql');
        const migration = readFileSync(migrationPath, 'utf-8');
        await sql.query(migration);
        console.log('✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
