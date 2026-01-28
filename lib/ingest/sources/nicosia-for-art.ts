
import type { SourceAdapter, RawEventStub, RawEventDetail, CanonicalEvent } from '../types';
import { fetchWithRetry, deriveExternalId, detectCity } from '../utils';
import { load } from 'cheerio';

/**
 * Nicosia For Art (Nicosia Municipality)
 * https://www.nicosiaforart.cy/
 */
export class NicosiaForArtAdapter implements SourceAdapter {
    name = 'nicosia_for_art';
    frequency: 'weekly' = 'weekly';
    private baseUrl = 'https://www.nicosiaforart.cy/en-gb/events/events/'; // English Listing page

    async list(): Promise<RawEventStub[]> {
        console.log(`[Nicosia For Art] Listing events from ${this.baseUrl}...`);
        const response = await fetchWithRetry(this.baseUrl);
        const html = await response.text();
        const $ = load(html);

        const stubs: RawEventStub[] = [];

        // Updated selector strategy
        // English page structure similar to Greek: H5 > A for titles
        $('h3 a, h4 a, h5 a, .event-item a').each((_, el) => {
            const link = $(el);
            const url = link.attr('href');
            const title = link.text().trim();

            // Absolute URL if relative
            const fullUrl = url && !url.startsWith('http') ? `https://www.nicosiaforart.cy${url}` : url;

            // Exclude "Read More" logic for English
            if (title && fullUrl && !title.toLowerCase().includes('read more') && !title.includes('Περισσότερα')) {
                const container = link.closest('div, li, article');
                let imageUrl = container.find('img').attr('src');
                if (imageUrl && !imageUrl.startsWith('http') && imageUrl.startsWith('/')) {
                    imageUrl = `https://www.nicosiaforart.cy${imageUrl}`;
                }

                stubs.push({
                    title,
                    url: fullUrl,
                    imageUrl
                });
            }
        });

        const unique = new Map();
        stubs.forEach(s => {
            if (s.title && s.url) unique.set(s.url, s);
        });

        const finalStubs = Array.from(unique.values());
        console.log(`[Nicosia For Art] Found ${finalStubs.length} events.`);
        return finalStubs;
    }

    async detail(stub: RawEventStub): Promise<RawEventDetail> {
        console.log(`[Nicosia For Art] Fetching details for ${stub.url}...`);
        const response = await fetchWithRetry(stub.url);
        const html = await response.text();
        const $ = load(html);

        const title = $('h1').first().text().trim() || stub.title;
        const description = $('.event-description, .content-area, .content').text().trim();

        // Date extraction based on browser audit:
        // Structure is <div class="row mt-0 mb-2 ..."><div class="col-auto ..."> [Icon] Date </div> ... </div>
        // Text example: "Fri, 06 Feb. 2026"
        let dateStr = '';
        let timeStr = '';

        $('.row.mt-0.mb-2 .col-auto').each((i, el) => {
            const text = $(el).text().trim();
            // Look for date pattern (e.g., "Fri, 06 Feb. 2026", "2026", etc)
            if (/\d{4}/.test(text) && (text.includes(',') || text.includes('.') || text.length > 5)) {
                // Avoid generic text, look for month names or "Fri/Mon/etc"
                if (text.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Mon|Tue|Wed|Thu|Fri|Sat|Sun)/i)) {
                    dateStr = text;
                }
            }
            // Look for time pattern (e.g., "19:30")
            if (/\d{1,2}:\d{2}/.test(text)) {
                timeStr = text;
            }
        });

        // Clean date string (remove icon text if any captured, though .text() usually ok)
        // Combine
        const startAt = dateStr ? (timeStr ? `${dateStr} ${timeStr}` : dateStr) : undefined;

        const venueName = 'Nicosia Municipal Theatre';

        return {
            title,
            description,
            startAt: startAt ? new Date(startAt.replace(/\./g, '')) : undefined, // Remove dots from "Feb." for easier parsing
            imageUrl: stub.imageUrl,
            tags: [],
            venue: { name: venueName },
            city: 'Nicosia',
            category: 'Theatre',
            language: 'en'
        };
    }

    mapToCanonical(raw: RawEventStub & Partial<RawEventDetail>): CanonicalEvent {
        return {
            title: raw.title,
            description: raw.description,
            startAt: raw.startAt || new Date(), // Fallback
            venue: raw.venue,
            city: 'Nicosia',
            category: raw.category || 'Theatre',
            tags: raw.tags,
            imageUrl: raw.imageUrl,
            ticketUrl: raw.url,
            sourceName: this.name,
            sourceUrl: raw.url,
            sourceExternalId: deriveExternalId(raw.url),
        };
    }
}
