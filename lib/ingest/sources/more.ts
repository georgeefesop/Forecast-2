/**
 * More.com (Cyprus) adapter
 * https://www.more.com/cy-en/tickets/
 */

import type { SourceAdapter, RawEventStub, RawEventDetail, CanonicalEvent } from '../types';
import { fetchWithRetry, parseDate, deriveExternalId } from '../utils';
import { load } from 'cheerio';

export class MoreAdapter implements SourceAdapter {
    name = 'more_com';
    private baseUrl = 'https://www.more.com/cy-en/tickets/';
    private headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.more.com/'
    };

    async list(): Promise<RawEventStub[]> {
        console.log(`[More.com] Listing events from ${this.baseUrl}...`);
        const response = await fetchWithRetry(this.baseUrl, { headers: this.headers });
        const html = await response.text();
        const $ = load(html);

        const stubs: RawEventStub[] = [];

        $('article.play-template').each((_, el) => {
            const $el = $(el);

            const relUrl = $el.find('meta[itemprop="url"]').attr('content') ||
                $el.find('a#ItemLink').attr('href');

            if (!relUrl) return;

            const url = new URL(relUrl, 'https://www.more.com').href;
            const title = $el.find('meta[itemprop="description"]').attr('content') ||
                $el.find('.play-template__title').text().trim();

            const imageUrl = $el.find('meta[itemprop="image"]').attr('content');

            if (title && url) {
                stubs.push({
                    title,
                    url,
                    imageUrl: imageUrl ? new URL(imageUrl, 'https://www.more.com').href : undefined,
                });
            }
        });

        return stubs;
    }

    async detail(stub: RawEventStub): Promise<RawEventDetail> {
        console.log(`[More.com] Fetching details for ${stub.url}...`);
        const response = await fetchWithRetry(stub.url, { headers: this.headers });
        const html = await response.text();
        const $ = load(html);

        // Try to find JSON-LD
        let detail: RawEventDetail = {
            title: stub.title,
            imageUrl: stub.imageUrl,
        };

        const jsonLdScript = $('script[type="application/ld+json"]').first().html();
        if (jsonLdScript) {
            try {
                const data = JSON.parse(jsonLdScript);
                if (data && data['@type'] === 'Event') {
                    detail.title = data.name || detail.title;
                    detail.description = data.description;

                    // More.com sometimes uses arrays for startDate/endDate
                    const startStr = Array.isArray(data.startDate) ? data.startDate[0] : data.startDate;
                    const endStr = Array.isArray(data.endDate) ? data.endDate[0] : data.endDate;

                    if (startStr) {
                        // More.com format: "2/20/2026 10:00:00 PM"
                        // native Date can often handle this, but let's be careful
                        const date = new Date(startStr);
                        if (!isNaN(date.getTime())) {
                            detail.startAt = date;
                        }
                    }

                    if (endStr) {
                        const date = new Date(endStr);
                        if (!isNaN(date.getTime())) {
                            detail.endAt = date;
                        }
                    }

                    if (data.image) {
                        if (data.image.startsWith('http')) {
                            detail.imageUrl = data.image;
                        } else if (data.image.startsWith('www.more.com')) {
                            detail.imageUrl = `https://${data.image}`;
                        } else {
                            detail.imageUrl = new URL(data.image, 'https://www.more.com').href;
                        }
                    }

                    // Extract Location
                    if (data.location) {
                        if (data.location.name) {
                            detail.venue = { name: data.location.name };
                        }
                        if (typeof data.location.address === 'string') {
                            detail.address = data.location.address;
                        } else if (data.location.address && data.location.address.streetAddress) {
                            detail.address = data.location.address.streetAddress;
                        }
                    }
                }
            } catch (e) {
                console.error('Error parsing JSON-LD for More.com:', e);
            }
        }

        // Fallback: Extract Venue and City from text if not in JSON-LD
        // Example: "DownΤown Live - Nicosia, Cyprus"
        if (!detail.venue) {
            const venueCityText = $('.events-container__item-venue').first().text().trim();
            if (venueCityText) {
                const parts = venueCityText.split(' - ');
                if (parts.length >= 2) {
                    detail.venue = { name: parts[0].trim() };
                    const cityPart = parts[1].split(',')[0].trim();
                    if (!detail.address) detail.address = cityPart;
                } else {
                    detail.venue = { name: venueCityText };
                }
            }
        }

        // Fallback image from meta tags if not found
        if (!detail.imageUrl) {
            detail.imageUrl = $('meta[property="og:image"]').attr('content') ||
                $('meta[property="twitter:image"]').attr('content');
        }

        // Clean up image URL if it has resizing params
        if (detail.imageUrl && detail.imageUrl.includes('more.com')) {
            // More.com sometimes has /thumbs/ or ?w= in URLs
            detail.imageUrl = detail.imageUrl.replace(/\/thumbs\//, '/assets/').split('?')[0];
        }

        return {
            ...detail,
            language: 'en' // Scraped from /cy-en/
        };
    }

    mapToCanonical(raw: RawEventStub & Partial<RawEventDetail>): CanonicalEvent {
        // Basic normalization. city and timezone mapping happens in orchestrator's normalize phase
        // but we can provide hints here.

        // Extract city from address if it was set to just a city name
        let city = 'Limassol'; // Default for Cyprus if we can't tell? 
        // Actually More.com has Nicosia events too.

        if (raw.address) {
            const lower = raw.address.toLowerCase();
            if (lower.includes('nicosia') || lower.includes('lefkosia')) city = 'Nicosia';
            else if (lower.includes('limassol') || lower.includes('lemesos')) city = 'Limassol';
            else if (lower.includes('paphos') || lower.includes('pafos')) city = 'Paphos';
            else if (lower.includes('larnaca') || lower.includes('larnaka')) city = 'Larnaca';
            else if (lower.includes('paralimni') || lower.includes('ayia napa') || lower.includes('famagusta')) city = 'Famagusta';
        }

        return {
            title: raw.title,
            description: raw.description,
            startAt: raw.startAt || new Date(),
            endAt: raw.endAt,
            city: city,
            venue: raw.venue ? { name: raw.venue.name } : undefined,
            address: raw.address,
            imageUrl: raw.imageUrl,
            ticketUrl: raw.url,
            sourceName: this.name,
            sourceUrl: raw.url,
            sourceExternalId: deriveExternalId(raw.url),
            isHighRes: raw.imageUrl ? !raw.imageUrl.includes('placeholder') && !raw.imageUrl.includes('thumb') : false
        };
    }
}
