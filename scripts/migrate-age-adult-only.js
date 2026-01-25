#!/usr/bin/env node

/**
 * Age and Adult-Only Migration Script
 */

const { readFileSync } = require('fs');
const { join } = require('path');
const { config } = require('dotenv');
const { sql } = require('@vercel/postgres');

config({ path: join(process.cwd(), '.env.local') });

async function migrate() {
  try {
    console.log('🔄 Starting age and adult-only migration...\n');

    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL is not set');
      process.exit(1);
    }

    const migrationPath = join(process.cwd(), 'lib/db/migrations/add-age-and-adult-only.sql');
    const migration = readFileSync(migrationPath, 'utf-8');

    console.log('📝 Executing migration...\n');

    try {
      await sql.query(migration);
      console.log('✅ Migration executed successfully!\n');
    } catch (error) {
      if (
        error.message?.includes('already exists') ||
        error.message?.includes('duplicate column')
      ) {
        console.log('⚠️  Some objects already exist (this is normal if re-running)\n');
      } else {
        throw error;
      }
    }

    console.log('🎉 Migration completed!');
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
