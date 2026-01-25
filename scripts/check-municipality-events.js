#!/usr/bin/env node

const { sql } = require('@vercel/postgres');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function check() {
  console.log('--- Limassol Municipality Events ---');
  const result = await sql.query(`
    SELECT id, title, slug, source_name, source_url, start_at 
    FROM events 
    WHERE source_name = 'limassol_municipality'
    ORDER BY created_at DESC
  `);

  result.rows.forEach((event, i) => {
    console.log(`\n${i + 1}. ${event.title}`);
    console.log(`   Slug: ${event.slug}`);
    console.log(`   Source: ${event.source_name}`);
    console.log(`   URL: ${event.source_url}`);
    console.log(`   Date: ${event.start_at}`);
  });

  console.log('\n--- Searching for missing event ---');
  const missing = await sql.query(`
    SELECT id, title, source_name, source_url, start_at 
    FROM events 
    WHERE title ILIKE '%Δημόσια Διαβούλευση%'
  `);

  if (missing.rows.length > 0) {
    missing.rows.forEach((event, i) => {
      console.log(`\nFound: ${event.title}`);
      console.log(`   Source: ${event.source_name || 'NULL'}`);
      console.log(`   URL: ${event.source_url}`);
    });
  } else {
    console.log('Event not found in database.');
  }
}

check();
