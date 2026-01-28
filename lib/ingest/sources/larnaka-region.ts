
import type { SourceAdapter, RawEventStub, RawEventDetail, CanonicalEvent } from '../types';
import { fetchWithRetry, deriveExternalId, detectCity } from '../utils';
import { load } from 'cheerio';

/**
 * Larnaka Region (Tourism Board)
 * https://larnakaregion.com/events
 * Site is Angular-based. 
 * First approach: Try to fetch the list page. If dynamic, we might get empty results.
 * If dynamic, we'd typically need Puppeteer or an API endpoint.
 * Given "Web Scraping Expert" instructions, let's assume we can find an API or fallback to scraping visible server-side rendered content if available.
 * 
 * Update from audit: Browser saw content, implying it might be SSR or hydrated.
 * Let's try standard fetch first. If that fails, we can't do much without Puppeteer/Browserless in this environment 
 * (unless we use the browser tool for every scrape which is slow).
 * 
 * Wait, browser tool showed content. Let's try to find a JSON API endpoint from likely patterns.
 * Typical Angular pattern: /api/events or similar.
 * 
 * For now, we'll try standard scraping. If it returns 0 events, we'll know we need a different strategy.
 */
export class LarnakaRegionAdapter implements SourceAdapter {
    name = 'larnaka_region';
    private baseUrl = 'https://larnakaregion.com/events';

    async list(): Promise<RawEventStub[]> {
        console.log(`[Larnaka Region] Listing events from ${this.baseUrl}...`);
        const response = await fetchWithRetry(this.baseUrl);
        const html = await response.text();
        const $ = load(html);

        const stubs: RawEventStub[] = [];

        // Selectors based on Angular apps often having robust classes
        // Reviewing typical structure from browser inspection (mental model):
        // Often .event-item or similar.
        // Let's try generic article or card selectors if specific ones aren't known.

        // Hypothetical selectors based on visual structure seen in browser tool (cards)
        $('.views-row, .event-card, article').each((_, el) => {
            const $el = $(el);
            const link = $el.find('a').first();
            const url = link.attr('href');
            const title = $el.find('h3, h2, .title').text().trim();
            const imageUrl = $el.find('img').attr('src');

            // Absolute URL
            const fullUrl = url && !url.startsWith('http') ? `https://larnakaregion.com${url}` : url;

            if (title && fullUrl) {
                stubs.push({
                    title,
                    url: fullUrl,
                    imageUrl: imageUrl && !imageUrl.startsWith('http') ? `https://larnakaregion.com${imageUrl}` : imageUrl
                });
            }
        });

        console.log(`[Larnaka Region] Found ${stubs.length} events.`);
        return stubs;
    }

    async detail(stub: RawEventStub): Promise<RawEventDetail> {
        console.log(`[Larnaka Region] Fetching details for ${stub.url}...`);
        const response = await fetchWithRetry(stub.url);
        const html = await response.text();
        const $ = load(html);

        const title = $('h1').first().text().trim() || stub.title;
        const description = $('.field--name-body, .article-content').text().trim();
        const imageUrl = $('.field--name-field-image img').attr('src') || stub.imageUrl;

        const venueName = $('.field--name-field-venue').text().trim();
        // Date often in specific field
        const dateText = $('.field--name-field-event-date').text().trim();

        return {
            title,
            description,
            imageUrl: imageUrl && !imageUrl.startsWith('http') ? `https://larnakaregion.com${imageUrl}` : imageUrl,
            tags: [],
            venue: venueName ? { name: venueName } : undefined,
            city: 'Larnaca',
            category: 'Culture',
            language: 'en'
        };
    }

    mapToCanonical(raw: RawEventStub & Partial<RawEventDetail>): CanonicalEvent {
        return {
            title: raw.title,
            description: raw.description,
            startAt: raw.startAt || new Date(),
            venue: raw.venue,
            city: 'Larnaca',
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
