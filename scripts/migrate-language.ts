
import { db } from '../lib/db/client';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

config({ path: path.join(process.cwd(), '.env.local') });

async function migrate() {
    try {
        const sqlPath = path.join(process.cwd(), 'lib/db/migrations/add-language-support.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Applying migration: add-language-support.sql');
        await db.query(sql);
        console.log('Migration successful.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrate();
