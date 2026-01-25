const { sql } = require("@vercel/postgres");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function testQuery() {
  try {
    const testSlug = "electronic-music-night";
    console.log(`Testing query for slug: "${testSlug}"\n`);

    const result = await sql.query(
      `SELECT 
        e.*,
        v.name as venue_name,
        v.slug as venue_slug,
        v.city as venue_city,
        ec.interested_count,
        ec.going_count,
        ec.saves_count
      FROM events e
      LEFT JOIN venues v ON e.venue_id = v.id
      LEFT JOIN event_counters ec ON e.id = ec.event_id
      WHERE e.slug = $1 AND e.status = 'published'`,
      [testSlug]
    );

    if (result.rows.length > 0) {
      console.log("✅ Event found!");
      console.log(`   Title: ${result.rows[0].title}`);
      console.log(`   Slug: ${result.rows[0].slug}`);
      console.log(`   Status: ${result.rows[0].status}`);
    } else {
      console.log("❌ Event not found!");
      console.log("\nChecking all slugs in database:");
      const allSlugs = await sql.query(
        "SELECT slug, title FROM events WHERE status = 'published' LIMIT 5"
      );
      allSlugs.rows.forEach((row) => {
        console.log(`   - ${row.slug} (${row.title})`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

testQuery();
