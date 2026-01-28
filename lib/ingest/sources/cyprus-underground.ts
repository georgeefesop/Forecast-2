/**
 * Cyprus Underground adapter
 * https://cyprusunderground.com.cy/
 */

import type { SourceAdapter, RawEventStub, RawEventDetail, CanonicalEvent } from '../types';
import { fetchWithRetry, deriveExternalId, detectCity } from '../utils';
import { load } from 'cheerio';

export class CyprusUndergroundAdapter implements SourceAdapter {
    name = 'cyprus_underground';
    frequency: 'daily' = 'daily';
    private baseUrl = 'https://cyprusunderground.com.cy/';

    async list(): Promise<RawEventStub[]> {
        console.log(`[Cyprus Underground] Listing events from ${this.baseUrl}...`);
        const response = await fetchWithRetry(this.baseUrl);
        const html = await response.text();

        // Find the events JSON in the script tag
        // Look for events: {"2026-...": [...]}
        const eventsMatch = html.match(/events:\s*({[\s\S]+?})\s*,\s*\n/);

        if (!eventsMatch) {
            console.warn('[Cyprus Underground] No events object found in script tags.');
            return [];
        }

        try {
            const eventsData = JSON.parse(eventsMatch[1]);
            const stubs: RawEventStub[] = [];

            for (const date in eventsData) {
                const dayEvents = eventsData[date];
                for (const event of dayEvents) {
                    if (event.name && event.slug) {
                        stubs.push({
                            title: event.name,
                            url: `${this.baseUrl}event/${event.slug}`, // Constructing hypothetical detail URL
                            dateHint: date,
                            imageUrl: event.image_url,
                            // Store the raw data in the stub so detail() can reuse it
                            _raw: event
                        } as any);
                    }
                }
            }

            return stubs;
        } catch (e) {
            console.error('[Cyprus Underground] Failed to parse events JSON:', e);
            return [];
        }
    }

    async detail(stub: any): Promise<RawEventDetail> {
        // If we stored the raw data in list(), use it
        if (stub._raw) {
            const raw = stub._raw;
            const address = raw.venue?.location || raw.location;

            // Detect city
            let city = undefined;
            if (address) city = detectCity(address);
            if (!city && raw.venue?.name) city = detectCity(raw.venue.name);
            // Default to Limassol only if we are sure? Or better to let normalize fallback? 
            // The scraper was defaulting to Limassol before. 
            // If detection fails, maybe "Cyprus Underground" events are mostly Limassol based on previous logic?
            // "Limassol" was hardcoded in mapToCanonical. 
            // Let's rely on detection. If it fails, normalizeEvent will make it "Cyprus".

            return {
                title: raw.name,
                description: raw.description || raw.short_description,
                startAt: raw.event_datetime ? new Date(raw.event_datetime.replace(' ', 'T')) : undefined,
                venue: raw.venue ? { name: raw.venue.name } : (raw.location ? { name: raw.location } : undefined),
                address: address,
                city: city, // Pass explicit city
                tags: raw.genre ? [raw.genre.name] : (raw.genres ? raw.genres.map((g: any) => g.name) : []),
                priceMin: raw.price,
                imageUrl: raw.image_url,
                ticketUrl: raw.external_url || stub.url,
                category: 'Music',
            };
        }

        // Fallback to scraping if needed (though list should cover it)
        return {
            title: stub.title,
            imageUrl: stub.imageUrl,
            category: 'Music',
        };
    }

    mapToCanonical(raw: RawEventStub & Partial<RawEventDetail>): CanonicalEvent {
        let city = 'Limassol';
        if (raw.address) {
            const lower = raw.address.toLowerCase();
            if (lower.includes('nicosia') || lower.includes('lefkosia')) city = 'Nicosia';
            else if (lower.includes('larnaca') || lower.includes('larnaka')) city = 'Larnaca';
            else if (lower.includes('paphos') || lower.includes('pafos')) city = 'Paphos';
            else if (lower.includes('famagusta') || lower.includes('ayia napa') || lower.includes('protaras')) city = 'Famagusta';
        }

        return {
            title: raw.title,
            description: raw.description,
            startAt: raw.startAt || new Date(),
            venue: raw.venue ? { name: raw.venue.name } : undefined,
            address: raw.address,
            city,
            category: 'Music',
            tags: raw.tags,
            priceMin: raw.priceMin,
            imageUrl: raw.imageUrl,
            ticketUrl: raw.url,
            sourceName: this.name,
            sourceUrl: raw.url,
            sourceExternalId: deriveExternalId(raw.url),
        };
    }
}
