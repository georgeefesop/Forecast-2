#!/usr/bin/env node

/**
 * Cleanup script to remove test/placeholder data
 * Deletes:
 * - All events without source_name (placeholder/test events)
 * - All user accounts except the current user (specified via env var)
 * 
 * Usage:
 *   KEEP_USER_ID=your-user-id node scripts/cleanup-test-data.js
 * 
 * Or interactively:
 *   node scripts/cleanup-test-data.js
 */

const { sql } = require("@vercel/postgres");
const dotenv = require("dotenv");
const path = require("path");
const readline = require("readline");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function cleanup() {
  try {
    console.log("🧹 Starting cleanup of test/placeholder data...\n");

    if (!process.env.DATABASE_URL) {
      console.error("❌ DATABASE_URL is not set in environment variables");
      process.exit(1);
    }

    // Get user ID to keep
    let keepUserId = process.env.KEEP_USER_ID;
    
    if (!keepUserId) {
      // Try to find users that are NOT test users (have real email domains, not @example.com)
      const realUsers = await sql.query(
        `SELECT user_id, handle, email, created_at 
         FROM profiles 
         WHERE email IS NOT NULL AND email NOT LIKE '%@example.com'
         ORDER BY created_at DESC 
         LIMIT 5`
      );

      if (realUsers.rows.length > 0) {
        // Use the most recent real user
        keepUserId = realUsers.rows[0].user_id;
        console.log(`✅ Auto-selected user to keep: ${realUsers.rows[0].handle} (${keepUserId})`);
      } else {
        // Fallback: find the most recent user
        const recentUsers = await sql.query(
          `SELECT user_id, handle, email, created_at 
           FROM profiles 
           ORDER BY created_at DESC 
           LIMIT 1`
        );

        if (recentUsers.rows.length === 0) {
          console.log("⚠️  No users found in database");
          return;
        }

        keepUserId = recentUsers.rows[0].user_id;
        console.log(`⚠️  No real users found, keeping most recent: ${recentUsers.rows[0].handle} (${keepUserId})`);
      }
    }

    if (!keepUserId) {
      console.error("❌ No user ID to keep");
      process.exit(1);
    }

    // Verify user exists
    const userCheck = await sql.query(
      "SELECT user_id, handle FROM profiles WHERE user_id = $1",
      [keepUserId]
    );

    if (userCheck.rows.length === 0) {
      console.error(`❌ User ${keepUserId} not found`);
      process.exit(1);
    }

    console.log(`✅ Keeping user: ${userCheck.rows[0].handle} (${keepUserId})\n`);

    // Count placeholder events (no source_name)
    const placeholderEvents = await sql.query(
      "SELECT COUNT(*) as count FROM events WHERE source_name IS NULL"
    );
    const eventCount = parseInt(placeholderEvents.rows[0].count);

    // Count test users (excluding the one to keep)
    const testUsers = await sql.query(
      `SELECT COUNT(*) as count FROM profiles WHERE user_id != $1`,
      [keepUserId]
    );
    const userCount = parseInt(testUsers.rows[0].count);

    console.log(`📊 Found:`);
    console.log(`   - ${eventCount} placeholder events (no source_name)`);
    console.log(`   - ${userCount} test user accounts to delete\n`);

    if (eventCount === 0 && userCount === 0) {
      console.log("✅ No test data to clean up!");
      return;
    }

    // Auto-confirm if KEEP_USER_ID is set, otherwise ask
    if (!process.env.KEEP_USER_ID) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const confirm = await new Promise((resolve) => {
        rl.question("⚠️  This will permanently delete the above data. Continue? (yes/no): ", resolve);
      });
      
      rl.close();
      
      if (confirm.toLowerCase() !== "yes" && confirm.toLowerCase() !== "y") {
        console.log("❌ Cleanup cancelled");
        return;
      }
    } else {
      console.log("⚠️  Proceeding with cleanup (KEEP_USER_ID is set)...\n");
    }

    // Delete placeholder events
    if (eventCount > 0) {
      console.log("\n🗑️  Deleting placeholder events...");
      
      // First, delete related data
      await sql.query(
        `DELETE FROM event_actions WHERE event_id IN (
          SELECT id FROM events WHERE source_name IS NULL
        )`
      );
      
      await sql.query(
        `DELETE FROM comments WHERE event_id IN (
          SELECT id FROM events WHERE source_name IS NULL
        )`
      );
      
      await sql.query(
        `DELETE FROM event_counters WHERE event_id IN (
          SELECT id FROM events WHERE source_name IS NULL
        )`
      );
      
      await sql.query(
        `DELETE FROM vibe_checks WHERE event_id IN (
          SELECT id FROM events WHERE source_name IS NULL
        )`
      );

      // Delete the events
      const deleteResult = await sql.query(
        "DELETE FROM events WHERE source_name IS NULL RETURNING id"
      );
      
      console.log(`   ✓ Deleted ${deleteResult.rows.length} placeholder events`);
    }

    // Delete test users (and their related data)
    if (userCount > 0) {
      console.log("\n🗑️  Deleting test user accounts...");
      
      // Get user IDs to delete
      const usersToDelete = await sql.query(
        `SELECT user_id FROM profiles WHERE user_id != $1`,
        [keepUserId]
      );

      const userIdsToDelete = usersToDelete.rows.map((row) => row.user_id);

      if (userIdsToDelete.length > 0) {
        // Delete related data for these users
        await sql.query(
          `DELETE FROM event_actions WHERE user_id = ANY($1)`,
          [userIdsToDelete]
        );
        
        await sql.query(
          `DELETE FROM comments WHERE user_id = ANY($1)`,
          [userIdsToDelete]
        );
        
        await sql.query(
          `DELETE FROM vibe_checks WHERE user_id = ANY($1)`,
          [userIdsToDelete]
        );
        
        await sql.query(
          `DELETE FROM reports WHERE reporter_user_id = ANY($1) OR target_id = ANY($1)`,
          [userIdsToDelete]
        );
        
        await sql.query(
          `DELETE FROM submissions WHERE user_id = ANY($1)`,
          [userIdsToDelete]
        );
        
        await sql.query(
          `DELETE FROM campaigns WHERE owner_user_id = ANY($1)`,
          [userIdsToDelete]
        );

        // Delete the profiles
        const deleteResult = await sql.query(
          `DELETE FROM profiles WHERE user_id = ANY($1) RETURNING user_id, handle`,
          [userIdsToDelete]
        );
        
        console.log(`   ✓ Deleted ${deleteResult.rows.length} user accounts:`);
        deleteResult.rows.forEach((user) => {
          console.log(`     - ${user.handle} (${user.user_id})`);
        });
      }
    }

    // Clean up orphaned venues (venues not referenced by any events)
    console.log("\n🧹 Cleaning up orphaned venues...");
    const orphanedVenues = await sql.query(
      `DELETE FROM venues 
       WHERE id NOT IN (SELECT DISTINCT venue_id FROM events WHERE venue_id IS NOT NULL)
       RETURNING id, name`
    );
    if (orphanedVenues.rows.length > 0) {
      console.log(`   ✓ Deleted ${orphanedVenues.rows.length} orphaned venues`);
    } else {
      console.log(`   ✓ No orphaned venues found`);
    }

    console.log("\n✅ Cleanup completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Deleted ${eventCount} placeholder events`);
    console.log(`   - Deleted ${userCount} test user accounts`);
    console.log(`   - Kept user: ${userCheck.rows[0].handle}`);
    console.log(`   - Ingested events (with source_name) are preserved`);

  } catch (error) {
    console.error("\n❌ Cleanup failed:", error);
    process.exit(1);
  }
}

cleanup();
