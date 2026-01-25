import * as cheerio from 'cheerio';
import { fetchWithRetry } from '../utils';
import type { SourceAdapter, RawEventStub, RawEventDetail, CanonicalEvent } from '../types';

/**
 * Rialto / Interticket program adapter
 * https://rialto.interticket.com/ticketsearch
 */
export class RialtoInterticketAdapter implements SourceAdapter {
  name = 'rialto_interticket';
  baseUrl = 'https://rialto.interticket.com';
  entryPoint = 'https://rialto.interticket.com/ticketsearch';

  // Keyword-based categorization
  private CATEGORY_KEYWORDS: Record<string, string[]> = {
    'Theatre': ['play', 'stage', 'drama', 'theatre', 'performance', 'tragedy', 'comedy', 'love', 'physical theater', 'actor', 'directing'],
    'Music': ['concert', 'music', 'live', 'piano', 'violin', 'orchestra', 'symphony', 'recital', 'band', 'song', 'singer', 'musical'],
    'Dance': ['dance', 'ballet', 'choreography', 'dancer'],
    'Cinema': ['film', 'movie', 'screening', 'documentary', 'director', 'cinema'],
    'Festival': ['festival']
  };

  private inferCategories(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const categories: string[] = [];

    for (const [category, keywords] of Object.entries(this.CATEGORY_KEYWORDS)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        categories.push(category);
      }
    }

    return categories.length > 0 ? categories : ['Other'];
  }

  private inferCity(venueName: string): string {
    const lowerVenue = venueName.toLowerCase();
    if (lowerVenue.includes('nicosia') || lowerVenue.includes('lefkosia')) return 'Nicosia';
    if (lowerVenue.includes('larnaca') || lowerVenue.includes('larnaka')) return 'Larnaca';
    if (lowerVenue.includes('paphos') || lowerVenue.includes('pafos')) return 'Paphos';
    if (lowerVenue.includes('limassol') || lowerVenue.includes('lemesos')) return 'Limassol';

    // Default to Limassol if it's Rialto, otherwise keep as is or default?
    // User says "some are definitely based in Nicosia".
    // If unknown, maybe default based on source? Rialto is in Limassol.
    return 'Limassol';
  }

  async list(): Promise<RawEventStub[]> {
    console.log(`[Rialto] Fetching list from ${this.entryPoint}...`);
    const response = await fetchWithRetry(this.entryPoint);
    const html = await response.text();
    const $ = cheerio.load(html);

    const stubs: Map<string, RawEventStub> = new Map();

    $('.programBox a').each((_, el) => {
      const href = $(el).attr('href');
      if (href && href.includes('/program/')) {
        const fullUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
        if (!stubs.has(fullUrl)) {
          stubs.set(fullUrl, {
            title: 'Fetching...',
            url: fullUrl,
          });
        }
      }
    });

    console.log(`[Rialto] Found ${stubs.size} potential event links.`);
    return Array.from(stubs.values());
  }

  async detail(stub: RawEventStub): Promise<RawEventDetail> {
    const response = await fetchWithRetry(stub.url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('div.programInfo > h1').text().trim();
    let dateStr = $('time.ticketTime').attr('datetime');
    if (!dateStr) {
      dateStr = $('time.ticketTime').text().trim();
    }

    const venueName = $('a.place').first().text().trim().replace(/[\n\t]+/g, ' ');
    const image = $('img.mainImg').attr('src');
    const description = $('.programDescription').text().trim();
    const priceText = $('.ticketBoxOne .price').first().text().trim();

    let startAt: Date | undefined;
    if (dateStr) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        startAt = d;
      }
    }

    if (!title || (!dateStr && description.length === 0)) {
      throw new Error('Invalid event data (likely secondary page)');
    }

    // Multiple categories
    const categories = this.inferCategories(title, description);
    const primaryCategory = categories[0];

    // Price parsing
    let priceMin: number | undefined;
    // Remove non-numeric except dot/comma, take first number
    // Handle "€15" or "15€" or "15"
    if (priceText) {
      const cleanPrice = priceText.replace(/[^\d.,]/g, '');
      // If price text exists but no digits, it might be "Free"
      const lowerPrice = priceText.toLowerCase();
      if (lowerPrice.includes('free') || lowerPrice.includes('dwrean')) {
        priceMin = 0;
      } else if (cleanPrice) {
        const match = cleanPrice.match(/(\d+([.,]\d+)?)/);
        if (match) {
          priceMin = parseFloat(match[0].replace(',', '.'));
        }
      }
    }

    // If we have a priceText that looks like money but parser failed, 
    // we should NOT return undefined (which means Free).
    // But if priceText is empty, maybe it really is specific query.

    return {
      title,
      description,
      startAt,
      venue: { name: venueName },
      imageUrl: image,
      category: primaryCategory,
      tags: categories, // Store all categories in tags
      priceMin,
    };
  }

  mapToCanonical(raw: RawEventStub & Partial<RawEventDetail>): CanonicalEvent {
    const city = raw.venue?.name ? this.inferCity(raw.venue.name) : 'Limassol';

    return {
      title: raw.title,
      description: raw.description,
      startAt: raw.startAt || new Date(),
      city,
      venue: raw.venue,
      category: raw.category,
      tags: raw.tags,
      priceMin: raw.priceMin,
      imageUrl: raw.imageUrl,
      ticketUrl: raw.url,
      sourceName: this.name,
      sourceUrl: raw.url,
      sourceExternalId: raw.url,
    };
  }
}
