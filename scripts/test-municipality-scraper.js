#!/usr/bin/env node

/**
 * Test script for Limassol Municipality scraper
 * Tests via the ingestion API endpoint
 * 
 * Usage: node scripts/test-municipality-scraper.js
 */

const http = require('http');

async function test() {
  console.log('🧪 Testing Limassol Municipality Scraper via API\n');
  console.log('📡 Calling ingestion endpoint...\n');
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/ingest/run-all',
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          
          if (result.success) {
            console.log('✅ Ingestion completed successfully\n');
            console.log(`Total events found: ${result.results.total}`);
            console.log(`Created: ${result.results.created}`);
            console.log(`Updated: ${result.results.updated}`);
            console.log(`Errors: ${result.results.errors}\n`);
            
            // Show municipality-specific results
            if (result.results.sourceResults?.limassol_municipality) {
              const munResults = result.results.sourceResults.limassol_municipality;
              console.log('📋 Limassol Municipality Results:');
              console.log(`   Total: ${munResults.total}`);
              console.log(`   Created: ${munResults.created}`);
              console.log(`   Updated: ${munResults.updated}`);
              if (munResults.errors) {
                console.log(`   Errors: ${munResults.errors}`);
              }
            }
            
            // Show sample errors if any
            if (result.results.errorDetails && result.results.errorDetails.length > 0) {
              console.log('\n⚠️  Sample errors:');
              result.results.errorDetails.slice(0, 5).forEach((err, i) => {
                console.log(`   ${i + 1}. ${err}`);
              });
            }
          } else {
            console.error('❌ Ingestion failed:', result.error);
          }
          
          resolve(result);
        } catch (error) {
          console.error('❌ Error parsing response:', error);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      console.log('\n💡 Make sure the dev server is running: npm run dev');
      reject(error);
    });

    req.end();
  });
}

test().catch(console.error);
