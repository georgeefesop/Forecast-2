
import type { SourceAdapter, RawEventStub, RawEventDetail, CanonicalEvent } from '../types';
import { fetchWithRetry, deriveExternalId, detectCity } from '../utils';
import { load } from 'cheerio';

/**
 * Visit Famagusta (Regional Board)
 * Uses 'The Events Calendar' (Tribe) WordPress Plugin
 * https://events.visitfamagusta.com.cy/
 */
export class VisitFamagustaAdapter implements SourceAdapter {
    name = 'visit_famagusta';
    frequency: 'weekly' = 'weekly';
    private baseUrl = 'https://events.visitfamagusta.com.cy/list/'; // Tribe events list URL standard

    async list(): Promise<RawEventStub[]> {
        console.log(`[Visit Famagusta] Listing events from ${this.baseUrl}...`);
        const response = await fetchWithRetry(this.baseUrl);
        const html = await response.text();
        const $ = load(html);

        const stubs: RawEventStub[] = [];

        // Schema.org JSON-LD is often present in Tribe Events
        const script = $('script[type="application/ld+json"]').filter((_, el) => {
            return $(el).html()?.includes('"@type":"Event"') || false;
        });

        if (script.length) {
            try {
                const json = JSON.parse(script.html() || '[]');
                const events = Array.isArray(json) ? json : [json];

                events.forEach((e: any) => {
                    if (e['@type'] === 'Event') {
                        stubs.push({
                            title: e.name,
                            url: e.url,
                            imageUrl: e.image,
                            startAt: e.startDate ? new Date(e.startDate) : undefined,
                            description: e.description,
                            // Store raw data for details
                            _raw: e
                        });
                    }
                });
            } catch (e) {
                console.warn('[Visit Famagusta] Failed to parse JSON-LD', e);
            }
        }

        // Fallback or Addition: scraping .tribe-events-calendar-list__event-row
        if (stubs.length === 0) {
            $('.tribe-events-calendar-list__event-row').each((_, el) => {
                const $el = $(el);
                const link = $el.find('.tribe-events-calendar-list__event-title-link');
                const url = link.attr('href');
                const title = link.text().trim();

                if (title && url) {
                    stubs.push({ title, url });
                }
            });
        }

        console.log(`[Visit Famagusta] Found ${stubs.length} events.`);
        return stubs;
    }

    async detail(stub: RawEventStub): Promise<RawEventDetail> {
        // If we got JSON-LD, we might already have most details!
        if (stub._raw) {
            const r = stub._raw;
            let city = 'Famagusta'; // Default region
            if (r.location?.address?.addressLocality) {
                city = r.location.address.addressLocality;
            } else if (r.location?.name) {
                // Try detecting from venue name
                const detected = detectCity(r.location.name);
                if (detected) city = detected;
            }

            return {
                title: r.name,
                description: r.description,
                startAt: r.startDate ? new Date(r.startDate) : undefined,
                endAt: r.endDate ? new Date(r.endDate) : undefined,
                venue: r.location ? { name: r.location.name } : undefined,
                address: r.location?.address?.streetAddress,
                city,
                imageUrl: r.image,
                url: r.url,
                category: 'Culture',
            } as any;
        }

        console.log(`[Visit Famagusta] Fetching details for ${stub.url}...`);
        const response = await fetchWithRetry(stub.url);
        const html = await response.text();
        const $ = load(html);

        const title = $('.tribe-events-single-event-title').text().trim();
        const description = $('.tribe-events-single-event-description').text().trim();
        const imageUrl = $('.tribe-events-event-image img').attr('src');

        const venueName = $('.tribe-events-venue-url').text().trim() || $('.tribe-events-venue-details').find('h3').text().trim();
        const address = $('.tribe-address').text().trim();

        let city = 'Famagusta';
        const locality = $('.tribe-locality').text().trim();
        if (locality) city = locality;
        else if (venueName) {
            const detected = detectCity(venueName);
            if (detected) city = detected;
        }

        return {
            title: title || stub.title,
            description,
            imageUrl: imageUrl || stub.imageUrl,
            tags: [],
            venue: venueName ? { name: venueName } : undefined,
            address,
            city,
            category: 'Culture', // Default
            language: 'en'
        };
    }

    mapToCanonical(raw: RawEventStub & Partial<RawEventDetail>): CanonicalEvent {
        return {
            title: raw.title,
            description: raw.description,
            startAt: raw.startAt || new Date(),
            venue: raw.venue,
            address: raw.address,
            city: raw.city || 'Famagusta',
            category: raw.category || 'Culture',
            tags: raw.tags,
            imageUrl: raw.imageUrl,
            ticketUrl: raw.url,
            sourceName: this.name,
            sourceUrl: raw.url,
            sourceExternalId: deriveExternalId(raw.url),
        };
    }
}
