const { sql } = require("@vercel/postgres");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function fixImage() {
  try {
    console.log("Fixing Electronic Music Night image...\n");

    // Update the image URL to a working one
    const result = await sql.query(
      `UPDATE events 
       SET image_url = $1 
       WHERE title ILIKE '%electronic music night%'
       RETURNING id, title, image_url`,
      ["https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop"]
    );

    if (result.rows.length > 0) {
      console.log("✅ Updated image URL:");
      console.log(`   Event: ${result.rows[0].title}`);
      console.log(`   New URL: ${result.rows[0].image_url}`);
    } else {
      console.log("⚠️  No event found matching 'Electronic Music Night'");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixImage();
