#!/usr/bin/env node

/**
 * Debug script to see exactly what's being extracted from the municipality list page
 */

const { LimassolMunicipalityAdapter } = require('../lib/ingest/sources/limassol-municipality');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function debug() {
  console.log('🔍 Debugging Limassol Municipality List Extraction\n');
  
  const adapter = new LimassolMunicipalityAdapter();
  
  try {
    const stubs = await adapter.list();
    
    console.log(`\n✅ Found ${stubs.length} events in list():\n`);
    
    stubs.forEach((stub, i) => {
      console.log(`\n${i + 1}. Title: ${stub.title}`);
      console.log(`   URL: ${stub.url}`);
      console.log(`   Date Hint: ${stub.dateHint || 'NONE'}`);
      console.log(`   Image: ${stub.imageUrl ? 'Yes' : 'No'}`);
    });
    
    // Now test detail extraction for the first event
    if (stubs.length > 0) {
      console.log(`\n\n🔍 Testing detail() for first event...\n`);
      const firstStub = stubs[0];
      
      try {
        const detail = await adapter.detail(firstStub);
        console.log('Detail extraction result:');
        console.log(`  Title: ${detail.title}`);
        console.log(`  Description: ${detail.description ? detail.description.substring(0, 100) + '...' : 'NONE'}`);
        console.log(`  Start: ${detail.startAt ? detail.startAt.toISOString() : 'NONE'}`);
        console.log(`  End: ${detail.endAt ? detail.endAt.toISOString() : 'NONE'}`);
        console.log(`  Venue: ${detail.venue?.name || 'NONE'}`);
      } catch (error) {
        console.error(`❌ Error in detail(): ${error.message}`);
        console.error(error.stack);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error(error.stack);
  }
}

debug();
