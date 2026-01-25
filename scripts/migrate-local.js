#!/usr/bin/env node

/**
 * Local database migration script
 * Runs the schema migration using DATABASE_URL from .env.local
 */

const { readFileSync } = require('fs');
const { join } = require('path');
const { config } = require('dotenv');
const { sql } = require('@vercel/postgres');

// Load .env.local
config({ path: join(process.cwd(), '.env.local') });

async function migrate() {
  try {
    console.log('🔄 Starting database migration...\n');

    // Check DATABASE_URL
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL is not set in environment variables');
      console.log('💡 Make sure you have .env.local file with DATABASE_URL');
      process.exit(1);
    }

    console.log('✅ DATABASE_URL found');
    console.log(`📊 Database: ${process.env.PGDATABASE || 'unknown'}\n`);

    // Read schema file
    const schemaPath = join(process.cwd(), 'lib/db/schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    // Execute the entire schema as one transaction
    // This handles PL/pgSQL functions and triggers correctly
    console.log('📝 Executing database schema...\n');

    try {
      await sql.query(schema);
      console.log('✅ Schema executed successfully!\n');
    } catch (error) {
      // Some errors are expected (e.g., "already exists")
      if (
        error.message?.includes('already exists') ||
        error.message?.includes('does not exist')
      ) {
        console.log('⚠️  Some objects already exist (this is normal if re-running migration)\n');
      } else {
        throw error;
      }
    }

    console.log('🎉 Schema migration completed!');

    // Verify tables
    console.log('\n🔍 Verifying tables...');
    const tablesResult = await sql.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const tables = tablesResult.rows.map((row) => row.table_name);
    const expectedTables = [
      'profiles',
      'venues',
      'events',
      'event_actions',
      'event_counters',
      'vibe_checks',
      'comments',
      'reports',
      'submissions',
      'campaigns',
      'placements',
      'orders',
      'newsletter_subscribers',
      'verification_tokens',
    ];

    const missingTables = expectedTables.filter((table) => !tables.includes(table));

    console.log(`\n📊 Tables found: ${tables.length}`);
    if (missingTables.length === 0) {
      console.log('✅ All expected tables exist!');
    } else {
      console.log(`⚠️  Missing tables: ${missingTables.join(', ')}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

migrate();
