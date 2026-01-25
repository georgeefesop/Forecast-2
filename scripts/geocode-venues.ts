
import { db } from '../lib/db/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Rate limit helper
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function geocodeVenues() {
    console.log('🌍 Starting venue geocoding...');

    try {
        // Get venues without coordinates
        const result = await db.query(
            'SELECT id, name, city, address FROM venues WHERE lat IS NULL OR lng IS NULL LIMIT 20'
        );

        const venues = result.rows;
        console.log(`Found ${venues.length} venues to geocode.`);

        let updated = 0;

        for (const venue of venues) {
            // Construct search query
            // Prefer address if available, otherwise Venue Name + City
            // Clean up venue name (remove extra details after comma if possible)
            const cleanName = venue.name.split(',')[0].trim();
            const query = venue.address
                ? `${venue.address}, ${venue.city}, Cyprus`
                : `${cleanName}, ${venue.city}, Cyprus`;

            console.log(`\nProcessing: ${venue.name} (${venue.city})`);
            console.log(`Query: ${query}`);

            try {
                const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;

                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Forecast2-Geocoder/1.0'
                    }
                });

                const data = await response.json();

                if (data && data.length > 0) {
                    const { lat, lon } = data[0];
                    console.log(`✅ Found: ${lat}, ${lon} (${data[0].display_name.substring(0, 50)}...)`);

                    await db.query(
                        'UPDATE venues SET lat = $1, lng = $2 WHERE id = $3',
                        [parseFloat(lat), parseFloat(lon), venue.id]
                    );
                    updated++;
                } else {
                    // Try fallback: Just City
                    console.log('⚠️ Not found. Retrying with just City...');
                    const cityUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(venue.city + ', Cyprus')}&limit=1`;
                    const cityRes = await fetch(cityUrl, { headers: { 'User-Agent': 'Forecast2-Geocoder/1.0' } });
                    const cityData = await cityRes.json();

                    if (cityData && cityData.length > 0) {
                        const { lat, lon } = cityData[0];
                        // Add small random jitter to prevent stacked pins if falling back to city center
                        const jitter = (Math.random() - 0.5) * 0.01;
                        const finalLat = parseFloat(lat) + jitter;
                        const finalLng = parseFloat(lon) + jitter;

                        console.log(`✅ Found (City Center): ${finalLat}, ${finalLng}`);
                        await db.query(
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

            // Wait 1.1s to respect Nominatim usage policy (max 1 req/sec)
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
