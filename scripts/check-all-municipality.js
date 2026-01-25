#!/usr/bin/env node

const { sql } = require('@vercel/postgres');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function check() {
  const result = await sql.query(`
    SELECT title, source_url, start_at, end_at, status 
    FROM events 
    WHERE source_name = 'limassol_municipality'
    ORDER BY start_at
  `);
  
  console.log(`Found ${result.rows.length} municipality events:\n`);
  result.rows.forEach((event, i) => {
    console.log(`${i + 1}. [${event.status}] ${event.title}`);
    console.log(`   URL: ${event.source_url}`);
    console.log(`   Start: ${event.start_at}`);
    if (event.end_at) {
      console.log(`   End: ${event.end_at}`);
    }
    console.log('');
  });
}

check();
