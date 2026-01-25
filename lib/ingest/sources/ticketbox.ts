
import { SourceAdapter, RawEventStub, RawEventDetail } from '../types';
import * as cheerio from 'cheerio';
import { fetchWithRetry } from '../utils';

export class TicketBoxAdapter implements SourceAdapter {
    name = 'ticketbox';
    private baseUrl = 'https://ticketbox.com.cy';

    async list(): Promise<RawEventStub[]> {
        console.log('[TicketBox] Fetching event list...');
        const html = await fetchWithRetry(this.baseUrl);
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
                    sourceId: fullUrl,
                    url: fullUrl,
                    title: title,
                    dateString: $(el).find('.date, time').text().trim(),
                    image: $(el).find('img').attr('src') || $(el).find('img').attr('data-src'),
                    location: $(el).find('.location, .venue').text().trim(),
                    price: $(el).find('.price').text().trim()
                });
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
                        sourceId: fullUrl,
                        url: fullUrl,
                        title: title,
                        dateString: '', // Populated in detail
                    });
                }
            });
        }

        console.log(`[TicketBox] Found ${events.length} candidates.`);
        return events;
    }

    async detail(stub: RawEventStub): Promise<RawEventDetail> {
        const html = await fetchWithRetry(stub.url);
        const $ = cheerio.load(html);

        // Refined Extraction
        const title = $('h1').first().text().trim() || stub.title;
        const description = $('.description, .content, #event-details').text().trim();
        const image = $('img.main-image, .event-image img').attr('src') || stub.image;
        const dateString = $('.date-time, .event-date').text().trim() || stub.dateString;
        const location = $('.venue, .location-address').text().trim() || stub.location;
        const price = $('.price-info').text().trim() || stub.price;

        return {
            title,
            description,
            image,
            dateString,
            location,
            price,
            categories: ['Tickets'] // Default until we find category tags
        };
    }
}
