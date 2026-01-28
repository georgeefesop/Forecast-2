
/**
 * Geocoding Tool
 * Encapsulates interactions with the Nominatim OpenStreetMap API.
 */

export interface GeocodeResult {
    lat: number;
    lng: number;
    display_name: string;
}

export class GeocodingTool {
    private static readonly USER_AGENT = 'Forecast2-Geocoder/1.0';
    private static readonly BASE_URL = 'https://nominatim.openstreetmap.org/search';

    /**
     * Geocode a query string into lat/long coordinates.
     * @param query The search query (e.g., "Venue Name, City, Cyprus")
     */
    static async geocode(query: string): Promise<GeocodeResult | null> {
        const url = `${this.BASE_URL}?format=json&q=${encodeURIComponent(query)}&limit=1`;

        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': this.USER_AGENT
                }
            });

            const data = await response.json();

            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon),
                    display_name: data[0].display_name
                };
            }
            return null;
        } catch (error) {
            console.error('GeocodingTool error:', error);
            throw error;
        }
    }
}
