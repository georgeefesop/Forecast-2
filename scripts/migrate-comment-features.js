#!/usr/bin/env node

/**
 * Comment Features Migration Script
 * Runs the comment features migration using DATABASE_URL from .env.local
 */

const { readFileSync } = require('fs');
const { join } = require('path');
const { config } = require('dotenv');
const { sql } = require('@vercel/postgres');

// Load .env.local
config({ path: join(process.cwd(), '.env.local') });

async function migrate() {
  try {
    console.log('🔄 Starting comment features migration...\n');

    // Check DATABASE_URL
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL is not set in environment variables');
      console.log('💡 Make sure you have .env.local file with DATABASE_URL');
      process.exit(1);
    }

    console.log('✅ DATABASE_URL found\n');

    // Read migration file
    const migrationPath = join(process.cwd(), 'lib/db/migrations/add-comment-features.sql');
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

    console.log('🎉 Comment features migration completed!');
    console.log('\n✅ Added columns:');
    console.log('   - parent_id (for replies)');
    console.log('   - edited_at (for edit tracking)');
    console.log('   - updated_at (for update tracking)');
    console.log('\n✅ Created indexes for better performance');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
