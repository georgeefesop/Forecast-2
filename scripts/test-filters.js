const { sql } = require("@vercel/postgres");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function testFilters() {
  try {
    console.log("Testing filters...\n");

    // Test 1: All events
    console.log("1. All events (no filters):");
    const allEvents = await sql.query(
      `SELECT e.id, e.title, e.city, e.category, e.price_min, e.start_at
       FROM events e
       WHERE e.status = 'published' AND e.start_at >= NOW()
       ORDER BY e.start_at ASC
       LIMIT 5`
    );
    console.log(`   Found ${allEvents.rows.length} events`);
    allEvents.rows.forEach((e) => {
      console.log(`   - ${e.title} | City: ${e.city} | Category: ${e.category}`);
    });

    // Test 2: Filter by city
    console.log("\n2. Filter by city='Limassol':");
    const limassolEvents = await sql.query(
      `SELECT e.id, e.title, e.city, e.category
       FROM events e
       LEFT JOIN venues v ON e.venue_id = v.id
       WHERE e.status = 'published' 
         AND e.start_at >= NOW()
         AND (LOWER(e.city) = LOWER($1) OR (v.city IS NOT NULL AND LOWER(v.city) = LOWER($1)))
       ORDER BY e.start_at ASC`,
      ["Limassol"]
    );
    console.log(`   Found ${limassolEvents.rows.length} events`);
    limassolEvents.rows.forEach((e) => {
      console.log(`   - ${e.title} | City: ${e.city} | Category: ${e.category}`);
    });

    // Test 3: Filter by category
    console.log("\n3. Filter by category='Music':");
    const musicEvents = await sql.query(
      `SELECT e.id, e.title, e.city, e.category
       FROM events e
       WHERE e.status = 'published' 
         AND e.start_at >= NOW()
         AND LOWER(e.category) = LOWER($1)
       ORDER BY e.start_at ASC`,
      ["Music"]
    );
    console.log(`   Found ${musicEvents.rows.length} events`);
    musicEvents.rows.forEach((e) => {
      console.log(`   - ${e.title} | City: ${e.city} | Category: ${e.category}`);
    });

    // Test 4: Filter by free
    console.log("\n4. Filter by free (price_min IS NULL OR price_min = 0):");
    const freeEvents = await sql.query(
      `SELECT e.id, e.title, e.city, e.category, e.price_min
       FROM events e
       WHERE e.status = 'published' 
         AND e.start_at >= NOW()
         AND (e.price_min IS NULL OR e.price_min = 0)
       ORDER BY e.start_at ASC`
    );
    console.log(`   Found ${freeEvents.rows.length} events`);
    freeEvents.rows.forEach((e) => {
      console.log(`   - ${e.title} | City: ${e.city} | Price: ${e.price_min || 0}`);
    });

    // Test 5: Combined filters
    console.log("\n5. Combined: city='Limassol' AND category='Food & Drink':");
    const combined = await sql.query(
      `SELECT e.id, e.title, e.city, e.category
       FROM events e
       LEFT JOIN venues v ON e.venue_id = v.id
       WHERE e.status = 'published' 
         AND e.start_at >= NOW()
         AND (LOWER(e.city) = LOWER($1) OR (v.city IS NOT NULL AND LOWER(v.city) = LOWER($1)))
         AND LOWER(e.category) = LOWER($2)
       ORDER BY e.start_at ASC`,
      ["Limassol", "Food & Drink"]
    );
    console.log(`   Found ${combined.rows.length} events`);
    combined.rows.forEach((e) => {
      console.log(`   - ${e.title} | City: ${e.city} | Category: ${e.category}`);
    });

    // Check actual data
    console.log("\n6. All event cities and categories in DB:");
    const allData = await sql.query(
      `SELECT DISTINCT e.city, e.category 
       FROM events e 
       WHERE e.status = 'published'
       ORDER BY e.city, e.category`
    );
    allData.rows.forEach((row) => {
      console.log(`   City: ${row.city} | Category: ${row.category || "NULL"}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

testFilters();
