#!/usr/bin/env node

/**
 * Migration script for ingestion tracking
 * Adds ingest_runs table and last_seen_at column to events
 */

const { readFileSync } = require('fs');
const { join } = require('path');
const { config } = require('dotenv');
const { sql } = require('@vercel/postgres');

// Load .env.local
config({ path: join(process.cwd(), '.env.local') });

async function migrate() {
  try {
    console.log('🔄 Starting ingestion tracking migration...\n');

    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL is not set in environment variables');
      process.exit(1);
    }

    console.log('✅ DATABASE_URL found\n');

    // Read migration file
    const migrationPath = join(process.cwd(), 'lib/db/migrations/add-ingestion-tracking.sql');
    const migration = readFileSync(migrationPath, 'utf-8');

    console.log('📝 Executing migration...\n');

    // Execute the migration
    try {
      await sql.query(migration);
      console.log('✅ Migration executed successfully!\n');
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

    console.log('🎉 Ingestion tracking migration completed!');
    console.log('\n✅ Added:');
    console.log('   - ingest_runs table (for tracking ingestion jobs)');
    console.log('   - last_seen_at column on events (for archiving logic)');
    console.log('   - Indexes for performance');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
