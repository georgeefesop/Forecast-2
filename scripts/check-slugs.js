const { sql } = require("@vercel/postgres");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function checkSlugs() {
  try {
    console.log("Checking event slugs...\n");

    const result = await sql.query(
      `SELECT title, slug FROM events WHERE status = 'published' ORDER BY created_at DESC LIMIT 5`
    );

    console.log("Event slugs in database:");
    result.rows.forEach((row, index) => {
      console.log(`\n${index + 1}. ${row.title}`);
      console.log(`   Slug: ${row.slug}`);
      console.log(`   URL: /event/${row.slug}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkSlugs();
