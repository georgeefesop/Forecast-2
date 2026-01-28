
import { DatabaseTool, GeocodingTool } from '../tools';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Rate limit helper
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function geocodeVenues() {
    console.log('🌍 Starting venue geocoding using GeocodingTool...');

    try {
        // Get venues without coordinates
        const venues = await DatabaseTool.query(
            'SELECT id, name, city, address FROM venues WHERE lat IS NULL OR lng IS NULL LIMIT 20'
        );

        console.log(`Found ${venues.length} venues to geocode.`);

        let updated = 0;

        for (const venue of venues) {
            const cleanName = venue.name.split(',')[0].trim();
            const query = venue.address
                ? `${venue.address}, ${venue.city}, Cyprus`
                : `${cleanName}, ${venue.city}, Cyprus`;

            console.log(`\nProcessing: ${venue.name} (${venue.city})`);
            console.log(`Query: ${query}`);

            try {
                const result = await GeocodingTool.geocode(query);

                if (result) {
                    console.log(`✅ Found: ${result.lat}, ${result.lng} (${result.display_name.substring(0, 50)}...)`);

                    await DatabaseTool.execute(
                        'UPDATE venues SET lat = $1, lng = $2 WHERE id = $3',
                        [result.lat, result.lng, venue.id]
                    );
                    updated++;
                } else {
                    // Try fallback: Just City
                    console.log('⚠️ Not found. Retrying with just City...');
                    const cityResult = await GeocodingTool.geocode(`${venue.city}, Cyprus`);

                    if (cityResult) {
                        // Add small random jitter to prevent stacked pins
                        const jitter = (Math.random() - 0.5) * 0.01;
                        const finalLat = cityResult.lat + jitter;
                        const finalLng = cityResult.lng + jitter;

                        console.log(`✅ Found (City Center): ${finalLat}, ${finalLng}`);
                        await DatabaseTool.execute(
                            'UPDATE venues SET lat = $1, lng = $2 WHERE id = $3',
                            [finalLat, finalLng, venue.id]
                        );
                        updated++;
                    } else {
                        console.log('❌ Failed to geocode.');
                    }
                }
            } catch (err) {
                console.error('Error fetching/updating:', err);
            }

            // Respect Nominatim usage policy (max 1 req/sec)
            await sleep(1100);
        }

        console.log(`\n🎉 Geocoding complete. Updated ${updated}/${venues.length} venues.`);
        process.exit(0);
    } catch (e) {
        console.error('Fatal error:', e);
        process.exit(1);
    }
}

geocodeVenues();
