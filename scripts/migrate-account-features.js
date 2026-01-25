#!/usr/bin/env node

/**
 * Account Features Migration Script
 * Runs the account features migration using DATABASE_URL from .env.local
 */

const { readFileSync } = require('fs');
const { join } = require('path');
const { config } = require('dotenv');
const { sql } = require('@vercel/postgres');

// Load .env.local
config({ path: join(process.cwd(), '.env.local') });

async function migrate() {
  try {
    console.log('🔄 Starting account features migration...\n');

    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL is not set in environment variables');
      process.exit(1);
    }

    console.log('✅ DATABASE_URL found\n');

    // Read migration file
    const migrationPath = join(process.cwd(), 'lib/db/migrations/account-features.sql');
    const migration = readFileSync(migrationPath, 'utf-8');

    console.log('📝 Executing account features migration...\n');

    try {
      await sql.query(migration);
      console.log('✅ Migration executed successfully!\n');
    } catch (error) {
      if (
        error.message?.includes('already exists') ||
        error.message?.includes('does not exist') ||
        error.message?.includes('duplicate column')
      ) {
        console.log('⚠️  Some objects already exist (this is normal if re-running)\n');
      } else {
        throw error;
      }
    }

    console.log('🎉 Account features migration completed!');

    // Verify new tables
    console.log('\n🔍 Verifying new tables...');
    const tablesResult = await sql.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name IN ('notification_preferences', 'event_subscriptions', 'subscriptions', 'payments', 'account_deletion_requests')
      ORDER BY table_name
    `);

    const tables = tablesResult.rows.map((row) => row.table_name);
    console.log(`📊 New tables found: ${tables.length}/5`);
    if (tables.length > 0) {
      console.log(`✅ Tables: ${tables.join(', ')}`);
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
