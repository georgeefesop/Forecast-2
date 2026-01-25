/**
 * Script to delete a user account and all related data
 * Usage: node scripts/delete-account.js <email>
 * Or: node scripts/delete-account.js --current (to delete current session user)
 */

const { config } = require('dotenv');
const { readFileSync } = require('fs');
const { join } = require('path');
const { sql } = require('@vercel/postgres');

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

async function deleteAccount(emailOrUserId) {
  try {
    console.log(`\n🔍 Looking up account: ${emailOrUserId}\n`);

    // First, find the user_id
    let userId;
    if (emailOrUserId.includes('@')) {
      // It's an email
      const result = await sql`
        SELECT user_id, email, handle FROM profiles WHERE email = ${emailOrUserId}
      `;
      if (result.rows.length === 0) {
        console.error(`❌ No account found with email: ${emailOrUserId}`);
        process.exit(1);
      }
      userId = result.rows[0].user_id;
      console.log(`✅ Found account:`);
      console.log(`   User ID: ${userId}`);
      console.log(`   Email: ${result.rows[0].email}`);
      console.log(`   Handle: ${result.rows[0].handle}`);
    } else {
      // It's a user_id
      const result = await sql`
        SELECT user_id, email, handle FROM profiles WHERE user_id = ${emailOrUserId}
      `;
      if (result.rows.length === 0) {
        console.error(`❌ No account found with user_id: ${emailOrUserId}`);
        process.exit(1);
      }
      userId = result.rows[0].user_id;
      console.log(`✅ Found account:`);
      console.log(`   User ID: ${userId}`);
      console.log(`   Email: ${result.rows[0].email}`);
      console.log(`   Handle: ${result.rows[0].handle}`);
    }

    console.log(`\n🗑️  Starting deletion process...\n`);

    // Delete in order (respecting foreign key constraints)
    // Tables with CASCADE will be deleted automatically, but we'll be explicit

    // 1. Delete account deletion requests
    await sql`DELETE FROM account_deletion_requests WHERE user_id = ${userId}`;
    console.log(`   ✓ Deleted account_deletion_requests`);

    // 2. Delete event subscriptions
    await sql`DELETE FROM event_subscriptions WHERE user_id = ${userId}`;
    console.log(`   ✓ Deleted event_subscriptions`);

    // 3. Delete notification preferences
    await sql`DELETE FROM notification_preferences WHERE user_id = ${userId}`;
    console.log(`   ✓ Deleted notification_preferences`);

    // 4. Delete vibe checks
    await sql`DELETE FROM vibe_checks WHERE user_id = ${userId}`;
    console.log(`   ✓ Deleted vibe_checks`);

    // 5. Delete event actions
    await sql`DELETE FROM event_actions WHERE user_id = ${userId}`;
    console.log(`   ✓ Deleted event_actions`);

    // 6. Delete comments (if exists)
    try {
      await sql`DELETE FROM comments WHERE user_id = ${userId}`;
      console.log(`   ✓ Deleted comments`);
    } catch (e) {
      // Table might not exist
    }

    // 7. Delete submissions
    await sql`DELETE FROM submissions WHERE user_id = ${userId}`;
    console.log(`   ✓ Deleted submissions`);

    // 8. Delete reports (where user is reporter)
    await sql`DELETE FROM reports WHERE reporter_user_id = ${userId}`;
    console.log(`   ✓ Deleted reports`);

    // 9. Delete campaigns and related placements/orders
    const campaigns = await sql`
      SELECT id FROM campaigns WHERE owner_user_id = ${userId}
    `;
    for (const campaign of campaigns.rows) {
      await sql`DELETE FROM placements WHERE campaign_id = ${campaign.id}`;
      await sql`DELETE FROM orders WHERE campaign_id = ${campaign.id}`;
    }
    await sql`DELETE FROM campaigns WHERE owner_user_id = ${userId}`;
    console.log(`   ✓ Deleted campaigns and related data`);

    // 10. Delete orders
    await sql`DELETE FROM orders WHERE user_id = ${userId}`;
    console.log(`   ✓ Deleted orders`);

    // 11. Clear venue claims (set to unclaimed)
    await sql`
      UPDATE venues 
      SET claim_status = 'unclaimed', claimed_by_user_id = NULL 
      WHERE claimed_by_user_id = ${userId}
    `;
    console.log(`   ✓ Cleared venue claims`);

    // 12. Clear event created_by (set to NULL or keep for historical purposes)
    // We'll keep events but clear the creator reference
    await sql`
      UPDATE events 
      SET created_by_user_id = NULL 
      WHERE created_by_user_id = ${userId}
    `;
    console.log(`   ✓ Cleared event creator references`);

    // 13. Delete subscriptions (has CASCADE but being explicit)
    await sql`DELETE FROM subscriptions WHERE user_id = ${userId}`;
    console.log(`   ✓ Deleted subscriptions`);

    // 14. Delete payments (has CASCADE but being explicit)
    await sql`DELETE FROM payments WHERE user_id = ${userId}`;
    console.log(`   ✓ Deleted payments`);

    // 15. Finally, delete the profile (this will cascade to any remaining references)
    await sql`DELETE FROM profiles WHERE user_id = ${userId}`;
    console.log(`   ✓ Deleted profile`);

    // 16. Delete verification tokens (NextAuth)
    await sql`DELETE FROM verification_tokens WHERE identifier = ${emailOrUserId.includes('@') ? emailOrUserId : (await sql`SELECT email FROM profiles WHERE user_id = ${userId}`).rows[0]?.email}`;
    console.log(`   ✓ Deleted verification tokens`);

    console.log(`\n✅ Account deletion completed successfully!\n`);
    console.log(`   All data for user ${userId} has been removed.\n`);

  } catch (error) {
    console.error('\n❌ Error deleting account:', error);
    process.exit(1);
  }
}

// Main execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/delete-account.js <email|user_id>');
  console.error('Example: node scripts/delete-account.js george.efesopk@gmail.com');
  process.exit(1);
}

const emailOrUserId = args[0];
deleteAccount(emailOrUserId);
