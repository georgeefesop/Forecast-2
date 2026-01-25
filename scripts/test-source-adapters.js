#!/usr/bin/env node

/**
 * Test individual source adapters to see what they're finding
 */

const { AllAboutLimassolAdapter } = require('../lib/ingest/sources/all-about-limassol');
const { LimassolMarinaAdapter } = require('../lib/ingest/sources/limassol-marina');
const { LimassolTourismAdapter } = require('../lib/ingest/sources/limassol-tourism');

async function testAdapter(adapter) {
  try {
    console.log(`\n🔍 Testing ${adapter.name}...`);
    console.log(`   Base URL: ${adapter.baseUrl || 'N/A'}`);
    
    const stubs = await adapter.list();
    console.log(`   ✅ Found ${stubs.length} events`);
    
    if (stubs.length > 0) {
      console.log(`   Sample titles:`);
      stubs.slice(0, 5).forEach((stub, i) => {
        console.log(`     ${i + 1}. "${stub.title}" - ${stub.url}`);
      });
      
      // Test detail fetching for first event
      if (adapter.detail && stubs.length > 0) {
        console.log(`   Testing detail fetch for first event...`);
        try {
          const detail = await adapter.detail(stubs[0]);
          console.log(`   ✅ Detail fetched: "${detail.title}"`);
          if (detail.description) {
            console.log(`      Description: ${detail.description.substring(0, 60)}...`);
          }
        } catch (error) {
          console.log(`   ⚠️  Detail fetch failed: ${error.message}`);
        }
      }
    } else {
      console.log(`   ⚠️  No events found - check selectors`);
    }
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
  }
}

async function testAll() {
  console.log('🧪 Testing source adapters...\n');
  
  const adapters = [
    new AllAboutLimassolAdapter(),
    new LimassolMarinaAdapter(),
    new LimassolTourismAdapter(),
  ];
  
  for (const adapter of adapters) {
    await testAdapter(adapter);
    // Small delay between adapters
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n✅ Testing complete');
}

testAll().catch(console.error);
