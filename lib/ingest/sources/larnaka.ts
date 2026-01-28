import { SourceAdapter, RawEventStub, RawEventDetail, CanonicalEvent } from '../types';
import { fetchWithRetry, deriveExternalId, parseDate, detectPrice } from '../utils';
import { load } from 'cheerio';

/**
 * Larnaca Municipality
 * https://www.larnaka.org.cy/en/information/cultural-activities-initiatives/events-calendar/
 */
export class LarnakaAdapter implements SourceAdapter {
    name = 'larnaka_municipality';
    frequency: 'weekly' = 'weekly';
    private baseUrl = 'https://www.larnaka.org.cy/en/information/cultural-activities-initiatives/events-calendar/';

    async list(): Promise<RawEventStub[]> {
        console.log(`[Larnaka] Listing events from ${this.baseUrl}...`);
        const response = await fetchWithRetry(this.baseUrl);
        const html = await response.text();
        const $ = load(html);

        const stubs: RawEventStub[] = [];

        $('.mec-event-article').each((_, el) => {
            const article = $(el);
            const anchor = article.find('.mec-event-title a');
            const url = anchor.attr('href');
            const title = anchor.text().trim();
            const dateHint = article.find('.mec-event-date').text().trim();

            if (url && title) {
                stubs.push({
                    title,
                    url,
                    dateHint
                });
            }
        });

        const unique = new Map();
        stubs.forEach(s => {
            if (s.title && s.url) unique.set(s.url, s);
        });

        return Array.from(unique.values());
    }

    async detail(stub: RawEventStub): Promise<RawEventDetail> {
        console.log(`[Larnaka] Fetching details for ${stub.url}...`);
        const response = await fetchWithRetry(stub.url);
        const html = await response.text();
        const $ = load(html);

        const title = $('h1').first().text().trim() || stub.title;
        const description = $('.mec-single-event-description').text().trim();

        // Extract occurrence date from URL or dateHint
        const urlObj = new URL(stub.url);
        const occurrence = urlObj.searchParams.get('occurrence');
        let startAt: Date | undefined;

        if (occurrence) {
            startAt = new Date(occurrence);
        } else if (stub.dateHint) {
            // dateHint is like "28Jan"
            const day = stub.dateHint.match(/^\d+/)?.[0];
            const monthStr = stub.dateHint.match(/[A-Za-z]+/)?.[0];
            if (day && monthStr) {
                const year = new Date().getFullYear();
                // Attempt to parse manually or via parseDate
                startAt = new Date(`${day} ${monthStr} ${year}`);
            }
        }

        const venueName = $('.mec-event-loc-place').first().text().trim() || 'Larnaca';

        // Detect price
        const priceInfo = detectPrice(description);

        return {
            title,
            description,
            startAt: startAt && !isNaN(startAt.getTime()) ? startAt : undefined,
            imageUrl: $('.mec-events-event-image img, .mec-single-event-description img').first().attr('src'),
            venue: { name: venueName },
            city: 'Larnaca',
            priceMin: priceInfo?.min,
            priceMax: priceInfo?.max,
            currency: priceInfo?.currency || 'EUR'
        };
    }

    mapToCanonical(raw: RawEventStub & Partial<RawEventDetail>): CanonicalEvent {
        return {
            title: raw.title,
            description: raw.description,
            startAt: raw.startAt || new Date(),
            city: 'Larnaca',
            venue: raw.venue,
            imageUrl: raw.imageUrl,
            ticketUrl: raw.url,
            sourceName: this.name,
            sourceUrl: raw.url,
            sourceExternalId: deriveExternalId(raw.url),
            language: 'en'
        };
    }
}
