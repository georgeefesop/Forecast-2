const { sql } = require("@vercel/postgres");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function checkJazz() {
  try {
    const result = await sql.query(
      `SELECT id, title, slug FROM events WHERE title ILIKE '%jazz%' LIMIT 1`
    );

    if (result.rows.length > 0) {
      console.log("Jazz event found:");
      console.log(JSON.stringify(result.rows[0], null, 2));
      console.log(`\nExpected URL: /event/${result.rows[0].slug}`);
    } else {
      console.log("No jazz event found");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkJazz();
