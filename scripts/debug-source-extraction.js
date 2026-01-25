#!/usr/bin/env node

/**
 * Debug what each source adapter is actually extracting
 */

const { AllAboutLimassolAdapter } = require('../lib/ingest/sources/all-about-limassol');
const { LimassolTourismAdapter } = require('../lib/ingest/sources/limassol-tourism');
const { LimassolMarinaAdapter } = require('../lib/ingest/sources/limassol-marina');

async function debugAdapter(adapter) {
  try {
    console.log(`\n🔍 Debugging ${adapter.name}...`);
    
    const stubs = await adapter.list();
    console.log(`   Found ${stubs.length} stubs from list()`);
    
    if (stubs.length === 0) {
      console.log(`   ⚠️  No events found - selectors may not match site structure`);
      return;
    }
    
    console.log(`   First 3 stubs:`);
    for (let i = 0; i < Math.min(3, stubs.length); i++) {
      const stub = stubs[i];
      console.log(`     ${i + 1}. Title: "${stub.title}"`);
      console.log(`        URL: ${stub.url}`);
      console.log(`        Date hint: ${stub.dateHint || 'none'}`);
      
      // Try to fetch detail
      if (adapter.detail) {
        try {
          const detail = await adapter.detail(stub);
          console.log(`        Detail title: "${detail.title}"`);
          console.log(`        Detail description: ${detail.description ? detail.description.substring(0, 60) + '...' : 'none'}`);
        } catch (error) {
          console.log(`        Detail fetch error: ${error.message}`);
        }
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
  }
}

async function debugAll() {
  console.log('🐛 Debugging source adapters...\n');
  
  const adapters = [
    new AllAboutLimassolAdapter(),
    new LimassolTourismAdapter(),
    new LimassolMarinaAdapter(),
  ];
  
  for (const adapter of adapters) {
    await debugAdapter(adapter);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

debugAll().catch(console.error);
