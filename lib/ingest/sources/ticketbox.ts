
import { SourceAdapter, RawEventStub, RawEventDetail } from '../types';
import * as cheerio from 'cheerio';
import { fetchWithRetry } from '../utils';

export class TicketBoxAdapter implements SourceAdapter {
    name = 'ticketbox';
    private baseUrl = 'https://ticketbox.com.cy';

    async list(): Promise<RawEventStub[]> {
        console.log('[TicketBox] Fetching event list...');
        const response = await fetchWithRetry(this.baseUrl);
        const html = await response.text();
        const $ = cheerio.load(html);
        const events: RawEventStub[] = [];

        // Note: Selectors are hypothetical based on common patterns 
        // and will be refined after first run output inspection
        // Looking for event cards
        $('div.event-card, div.card, a.event-link').each((_, el) => {
            const link = $(el).find('a').first().attr('href') || $(el).attr('href');
            const title = $(el).find('h3, h4, .title').text().trim();

            if (link && title) {
                const fullUrl = link.startsWith('http') ? link : this.baseUrl + link;
                // Basic stub
                events.push({
                    url: fullUrl,
                    title: title,
                    dateHint: $(el).find('.date, time').text().trim(),
                    imageUrl: $(el).find('img').attr('src') || $(el).find('img').attr('data-src'),
                    // @ts-ignore - passing extra data
                    location: $(el).find('.location, .venue').text().trim(),
                    // @ts-ignore - passing extra data
                    price: $(el).find('.price').text().trim(),
                    sourceId: fullUrl
                } as RawEventStub);
            }
        });

        // Fallback: If no structured cards found, look for all links that might be events
        if (events.length === 0) {
            console.log('[TicketBox] No structured cards found, trying generic link scan...');
            $('a[href*="/event/"]').each((_, el) => {
                const link = $(el).attr('href');
                const title = $(el).text().trim();
                if (link && title && title.length > 5) {
                    const fullUrl = link.startsWith('http') ? link : this.baseUrl + link;
                    events.push({
                        url: fullUrl,
                        title: title,
                        dateHint: '', // Populated in detail
                        imageUrl: ''
                    } as RawEventStub);
                }
            });
        }

        console.log(`[TicketBox] Found ${events.length} candidates.`);
        return events;
    }

    async detail(stub: RawEventStub): Promise<RawEventDetail> {
        const response = await fetchWithRetry(stub.url);
        const html = await response.text();
        const $ = cheerio.load(html);

        // Refined Extraction
        const title = $('h1').first().text().trim() || stub.title;
        const description = $('.description, .content, #event-details').text().trim();
        const image = $('img.main-image, .event-image img').attr('src') || stub.imageUrl;
        const dateString = $('.date-time, .event-date').text().trim() || stub.dateHint;
        const location = $('.venue, .location-address').text().trim() || (stub as any).location;
        const price = $('.price-info').text().trim() || (stub as any).price;

        return {
            title,
            description,
            imageUrl: image,
            venue: location ? { name: location } : undefined,
            priceMin: price ? parseFloat(price) : undefined, // Very basic parsing
            category: 'Tickets', // Default until we find category tags
            tags: ['Tickets'],
            language: stub.url.includes('/en') ? 'en' : 'el' // Basic inference
        };
    }

    mapToCanonical(raw: RawEventStub & Partial<RawEventDetail>): any {
        return raw;
    }
}
