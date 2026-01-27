/**
 * Rave Pulse (Cyprus) adapter
 * https://rave-pulse.com/
 */

import type { SourceAdapter, RawEventStub, RawEventDetail, CanonicalEvent } from '../types';
import { fetchWithRetry, deriveExternalId } from '../utils';
import { load } from 'cheerio';

export class RavePulseAdapter implements SourceAdapter {
    name = 'rave_pulse';
    private baseUrl = 'https://rave-pulse.com/events/';

    async list(): Promise<RawEventStub[]> {
        console.log(`[Rave Pulse] Listing events from ${this.baseUrl}...`);
        const response = await fetchWithRetry(this.baseUrl);
        const html = await response.text();
        const $ = load(html);

        const stubs: RawEventStub[] = [];

        // Rave Pulse uses EventChamp theme.
        // Listings are in .gt-event-style-3
        $('.gt-event-style-3').each((_, el) => {
            const $el = $(el);
            const url = $el.find('a').first().attr('href');
            const title = $el.find('.gt-title').text().trim();
            const dateHint = $el.find('.gt-date').text().trim();
            const imageUrl = $el.find('.gt-image img').attr('data-src') || $el.find('.gt-image img').attr('src');

            if (title && url) {
                stubs.push({
                    title,
                    url,
                    dateHint,
                    imageUrl,
                });
            }
        });

        return stubs;
    }

    async detail(stub: RawEventStub): Promise<RawEventDetail> {
        console.log(`[Rave Pulse] Fetching details for ${stub.url}...`);
        const response = await fetchWithRetry(stub.url);
        const html = await response.text();
        const $ = load(html);

        // Use meta description if content seems to be navigation
        let description = $('.gt-content').first().text().trim();
        const metaDesc = $('meta[property="og:description"]').attr('content');

        // If the description contains navigation keywords or is too short, prefer meta description
        if (description.includes('all events') || description.includes('submit an event') || description.length < 50) {
            if (metaDesc) {
                description = metaDesc;
            } else {
                // Fallback: try capturing text from paragraphs only
                description = $('.gt-content p').map((_, el) => $(el).text().trim()).get().join('\n\n');
            }
        }

        const detail: RawEventDetail = {
            title: stub.title,
            imageUrl: stub.imageUrl,
            description,
            tags: [],
        };

        // Extract Venue
        const venueName = $('.gt-event-venue').first().text().trim();
        if (venueName) {
            detail.venue = { name: venueName };
        }

        // Extract Location/Address for city mapping
        const address = $('.gt-event-location').first().text().trim();
        if (address) {
            detail.address = address;
        }

        // Search for sub-genres/tags
        $('.gt-event-category a, .gt-event-tag a').each((_, el) => {
            const tag = $(el).text().trim();
            if (tag && !detail.tags?.includes(tag)) {
                detail.tags?.push(tag);
            }
        });

        // Try to find a higher res image in meta tags
        const ogImage = $('meta[property="og:image"]').attr('content');
        if (ogImage) {
            detail.imageUrl = ogImage;
        }

        return {
            ...detail,
            category: 'Music',
            language: 'en'
        };
    }

    mapToCanonical(raw: RawEventStub & Partial<RawEventDetail>): CanonicalEvent {
        let city = 'Limassol';
        if (raw.address) {
            const lower = raw.address.toLowerCase();
            if (lower.includes('nicosia')) city = 'Nicosia';
            else if (lower.includes('larnaca')) city = 'Larnaca';
            else if (lower.includes('paphos')) city = 'Paphos';
            else if (lower.includes('ayia napa') || lower.includes('famagusta')) city = 'Famagusta';
        }

        return {
            title: raw.title,
            description: raw.description,
            startAt: raw.startAt || new Date(), // Date parsing handled by orchestrator/normalize
            venue: raw.venue ? { name: raw.venue.name } : undefined,
            address: raw.address,
            city,
            category: 'Music',
            tags: raw.tags,
            imageUrl: raw.imageUrl,
            ticketUrl: raw.url,
            sourceName: this.name,
            sourceUrl: raw.url,
            sourceExternalId: deriveExternalId(raw.url),
        };
    }
}
