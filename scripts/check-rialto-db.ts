
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Polyfill
if (!process.env.DATABASE_URL && process.env.POSTGRES_URL) {
    process.env.DATABASE_URL = process.env.POSTGRES_URL;
}

import { db } from '../lib/db/client';

async function check() {
    try {
        console.log('Checking Rialto events in DB...');
        // Assuming table name is 'events' or 'Event'? 
        // I didn't see schema.prisma, but usually it's standard.
        // Let's try to query 'Event' or 'events'.
        // lib/db/client uses raw SQL.
        // Let's check table names first or guess 'events' (plural lowercase common in Postgres) or 'Event' (Prisma default).
        // Safest is to check information_schema or just try 'Event' (Prisma default mapping often pascal or lowercase).
        // Let's try "SELECT count(*) FROM \"Event\" WHERE \"sourceName\" = 'rialto_interticket'"

        const result = await db.query(`SELECT count(*) as count FROM "Event" WHERE "sourceName" = 'rialto_interticket'`);
        console.log('Rialto Event Count:', result.rows[0].count);
        process.exit(0);
    } catch (err: any) {
        console.error('Check failed:', err.message);
        // Fallback: try lowercase table name
        try {
            const result = await db.query(`SELECT count(*) as count FROM "events" WHERE "source_name" = 'rialto_interticket'`);
            console.log('Rialto Event Count (lowercase):', result.rows[0].count);
            process.exit(0);
        } catch (err2) {
            console.error('Check failed (lowercase):', err2);
            process.exit(1);
        }
    }
}

check();
