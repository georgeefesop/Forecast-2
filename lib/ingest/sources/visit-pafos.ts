
import type { SourceAdapter, RawEventStub, RawEventDetail, CanonicalEvent } from '../types';
import { fetchWithRetry, deriveExternalId, detectCity } from '../utils';
import { load } from 'cheerio';

/**
 * Visit Paphos (Regional Board of Tourism)
 * Uses 'EventOn' WordPress Plugin
 * https://www.visitpafos.org.cy/events/
 */
export class VisitPafosAdapter implements SourceAdapter {
    name = 'visit_pafos';
    frequency: 'weekly' = 'weekly';
    // EventOn often loads events via AJAX, but usually renders initial month. 
    // We might need to iterate or hit their API if standard page navigation isn't enough.
    // For now, let's try the main list page.
    private baseUrl = 'https://www.visitpafos.org.cy/events/';

    async list(): Promise<RawEventStub[]> {
        console.log(`[Visit Pafos] Listing events from ${this.baseUrl}...`);
        const response = await fetchWithRetry(this.baseUrl);
        const html = await response.text();
        const $ = load(html);

        const stubs: RawEventStub[] = [];

        // EventOn Selectors
        // .eventon_list_event is the main container for each event
        $('.eventon_list_event').each((_, el) => {
            const $el = $(el);
            const url = $el.find('a.evcal_list_a').attr('href') || $el.data('event_url');
            const title = $el.find('.evcal_event_title').text().trim();
            const imageUrl = $el.find('.evcal_list_a').data('bg_image') || $el.find('img').attr('src');

            // Date parsing from EventOn micro-format if needed, but detail page is better
            // EventOn usually has: <span class="evcal_start_date" data-val="...">

            if (title && url) {
                stubs.push({
                    title,
                    url: url as string,
                    imageUrl,
                });
            }
        });

        console.log(`[Visit Pafos] Found ${stubs.length} events.`);
        return stubs;
    }

    async detail(stub: RawEventStub): Promise<RawEventDetail> {
        console.log(`[Visit Pafos] Fetching details for ${stub.url}...`);
        const response = await fetchWithRetry(stub.url);
        const html = await response.text();
        const $ = load(html);

        // EventOn Detail Page
        // Often loaded in a lightbox, but direct URL usually works for scraping.
        // Look for standard WP classes or EventOn specific ones.

        let title = $('.evo_event_title').text().trim() || $('.entry-title').text().trim() || stub.title;
        let description = $('.evo_event_content').text().trim() || $('.entry-content').text().trim();
        let imageUrl = $('.evo_event_main_img img').attr('src') || stub.imageUrl;

        // Dates
        // EventOn often uses schema.org metadata which is great
        let startAt = new Date();
        const schemaDate = $('meta[itemprop="startDate"]').attr('content');
        if (schemaDate) {
            startAt = new Date(schemaDate);
        } else {
            // Fallback to text parsing if needed
            const dateText = $('.evo_event_date').first().text().trim();
            // Simple parse attempt or let normalize handle it if undefined?
            // normalizeEvent expects a Date object usually
        }

        // Venue & Location
        const venueName = $('.evo_location_name').text().trim() || $('.evo_location').text().trim();
        const address = $('.evo_location_address').text().trim();

        const detail: RawEventDetail = {
            title,
            description,
            imageUrl,
            tags: [],
            startAt,
            venue: venueName ? { name: venueName } : undefined,
            address: address,
            city: 'Paphos', // Default to Paphos, but detect if possible
        };

        // Detect explicit city from address if possible, otherwise Paphos region default is safe-ish
        if (address) {
            const detected = detectCity(address);
            if (detected) detail.city = detected;
        }

        return {
            ...detail,
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
            city: raw.city || 'Paphos',
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
