
import { LimassolMunicipalityAdapter } from '../lib/ingest/sources/limassol-municipality';

async function main() {
  console.log('Testing Limassol Municipality Adapter...');
  const adapter = new LimassolMunicipalityAdapter();
  
  console.log('Fetching list...');
  const items = await adapter.list();
  console.log(`Found ${items.length} items.`);
  
  if (items.length > 0) {
    console.log('First 3 items:', JSON.stringify(items.slice(0, 3), null, 2));
    
    console.log('Fetching details for first item...');
    const detail = await adapter.detail(items[0]);
    console.log('Detail:', JSON.stringify(detail, null, 2));
  }
}

main().catch(console.error);
