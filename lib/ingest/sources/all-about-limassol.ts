/**
 * All About Limassol - Agenda adapter
 * https://allaboutlimassol.com/en/agenda/
 */

import type { SourceAdapter, RawEventStub, RawEventDetail } from '../types';
import { fetchWithRetry } from '../utils';
import { load } from 'cheerio';
import { parseDate } from '../utils';

export class AllAboutLimassolAdapter implements SourceAdapter {
  name = 'all_about_limassol';
  frequency: 'weekly' = 'weekly';
  private baseUrl = 'https://allaboutlimassol.com/en/agenda/';

  async list(): Promise<RawEventStub[]> {
    const response = await fetchWithRetry(this.baseUrl);
    const html = await response.text();
    const $ = load(html);

    const stubs: RawEventStub[] = [];

    // Find event links - structure may vary, try common patterns
    $('article, .event-item, .agenda-item, a[href*="/event"], a[href*="/agenda"]').each((_, el) => {
      const $el = $(el);

      // Try to find link
      const link = $el.find('a').first().attr('href') || $el.attr('href');
      if (!link) return;

      // Make absolute URL - handle relative paths properly
      let url: string;
      if (link.startsWith('http')) {
        url = link;
      } else {
        // Remove leading / if present
        const cleanLink = link.startsWith('/') ? link.substring(1) : link;

        // If cleanLink already starts with 'en/agenda', append to domain root
        if (cleanLink.startsWith('en/agenda') || cleanLink.startsWith('en/events')) {
          url = `https://allaboutlimassol.com/${cleanLink}`;
        } else {
          // Otherwise resolve against current base (which is .../en/agenda/)
          // But safer to just use domain root if we can
          url = new URL(link, 'https://allaboutlimassol.com/').href;
        }
      }

      // Clean up duplicate path segments if any remain
      url = url.replace(/([^:]\/)\/+/g, '$1');

      // Double check for duplicated en/agenda
      if (url.includes('/en/agenda/en/agenda/')) {
        url = url.replace('/en/agenda/en/agenda/', '/en/agenda/');
      }

      // Extract title - avoid date-like patterns
      let title = $el.find('h2, h3, .title, .event-title').first().text().trim() ||
        $el.text().trim().split('\n')[0].trim();

      // If title looks like a date range, try to find a better title
      // But allow generic titles like "Agenda" or "Events" through - detail() will fix them
      if (title.match(/^\d{1,2}\s*[-–]\s*\d{1,2}/)) {
        const altTitle = $el.find('.event-name, [class*="name"], [class*="title"]').not('h2, h3').first().text().trim();
        if (altTitle && altTitle.length > 3 && !altTitle.match(/^\d{1,2}\s*[-–]/)) {
          title = altTitle;
        } else {
          const linkText = $el.find('a').first().text().trim();
          if (linkText && linkText.length > 3 && !linkText.match(/^\d{1,2}\s*[-–]/)) {
            title = linkText;
          } else {
            // Skip this event - title is just a date range with no alternative
            return;
          }
        }
      }

      // Final validation - only reject pure date ranges, allow generic titles (detail() will fix)
      if (!title || title.length < 3 || title.match(/^\d{1,2}\s*[-–]\s*\d{1,2}(\s+\w+)?$/)) {
        return;
      }

      // Extract date hint
      const dateText = $el.find('.date, .event-date, time').first().text().trim() ||
        $el.text().match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/)?.[0];

      // Extract image
      const imageUrl = $el.find('img').first().attr('src') ||
        $el.find('img').first().attr('data-src');

      stubs.push({
        title,
        url,
        dateHint: dateText,
        imageUrl: imageUrl ? new URL(imageUrl, this.baseUrl).href : undefined,
      });
    });

    // If no events found with above selectors, try a more generic approach
    if (stubs.length === 0) {
      $('a[href*="event"], a[href*="agenda"]').each((_, el) => {
        const $link = $(el);
        const url = $link.attr('href');
        if (!url) return;

        const fullUrl = url.startsWith('http') ? url : new URL(url, this.baseUrl).href;
        const title = $link.text().trim() || $link.find('h1, h2, h3').first().text().trim();

        if (title && title.length > 3) {
          stubs.push({
            title,
            url: fullUrl,
          });
        }
      });
    }

    return stubs.slice(0, 50); // Limit to 50 events
  }

  async detail(stub: RawEventStub): Promise<RawEventDetail> {
    const response = await fetchWithRetry(stub.url);
    const html = await response.text();
    const $ = load(html);

    // Extract title from detail page - prioritize actual event titles
    let title = stub.title;

    // Try multiple selectors in order of preference
    const titleSelectors = [
      'h1',
      'h2.event-title',
      '.event-name',
      '[class*="event-title"]',
      '[class*="event-name"]',
      'article h1',
      'article h2',
      'meta[property="og:title"]',
      'title'
    ];

    for (const selector of titleSelectors) {
      let detailTitle: string;
      if (selector.startsWith('meta')) {
        detailTitle = $(selector).attr('content') || '';
      } else {
        detailTitle = $(selector).first().text().trim();
      }

      // If we found a better title (not a date range or generic), use it
      if (detailTitle && detailTitle.length > 3 &&
        !detailTitle.match(/^\d{1,2}\s*[-–]\s*\d{1,2}/) &&
        !detailTitle.match(/^(agenda|events?|all about limassol)$/i) &&
        detailTitle.length < 200) { // Reasonable title length
        title = detailTitle;
        break;
      }
    }

    // If still generic, try extracting from description first sentence
    if ((title.match(/^(agenda|events?)$/i) || title.length < 5) && $('.content, .event-description, article p').length > 0) {
      const firstPara = $('.content, .event-description, article p').first().text().trim();
      const firstSentence = firstPara.split(/[.!?]/)[0].trim();
      if (firstSentence && firstSentence.length > 10 && firstSentence.length < 100 &&
        !firstSentence.match(/^\d{1,2}\s*[-–]/) &&
        firstSentence[0] === firstSentence[0].toUpperCase()) {
        title = firstSentence;
      }
    }

    // Check if page is a 404 or error page
    const pageTitle = $('title').text().toLowerCase();
    if (pageTitle.includes('404') || pageTitle.includes('error') || pageTitle.includes('not found')) {
      // Skip this event - page doesn't exist
      throw new Error('Event page not found (404)');
    }

    // Extract description
    const description = $('.content, .event-description, article p, .description')
      .first()
      .text()
      .trim()
      .substring(0, 500);

    // Extract date/time
    let dateText = $('.date, .event-date, time, [datetime]').first().text().trim() ||
      $('[datetime]').first().attr('datetime');

    // Extract year from page content for context
    const pageText = $('body').text();
    const yearMatch = pageText.match(/\b(202[4-6])\b/);
    const contextYear = yearMatch ? parseInt(yearMatch[1]) : undefined;
    const parsedDate = dateText ? parseDate(dateText, undefined, contextYear) : undefined;
    const startAt = parsedDate || undefined;

    // Extract venue
    const venueName = $('.venue, .location, [class*="venue"]').first().text().trim();
    const venue = venueName ? { name: venueName } : undefined;

    // Extract address
    const address = $('.address, [class*="address"]').first().text().trim();

    // Extract category/tags
    const category = $('.category, .tag, [rel="tag"]').first().text().trim();
    const tags = $('.tags a, [rel="tag"]')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean);

    // Extract ticket URL
    const ticketUrl = $('a[href*="ticket"], a[href*="book"], .ticket-link a').first().attr('href');

    // Extract image
    const imageUrl = $('img[src*="event"], .event-image img, article img').first().attr('src') ||
      stub.imageUrl;

    return {
      title,
      description,
      startAt,
      venue,
      address,
      category,
      tags: tags.length > 0 ? tags : undefined,
      imageUrl: imageUrl ? new URL(imageUrl, stub.url).href : undefined,
      ticketUrl: ticketUrl ? new URL(ticketUrl, stub.url).href : undefined,
      language: 'en' // Scraped from /en/agenda/
    };
  }

  mapToCanonical(raw: RawEventStub & Partial<RawEventDetail>): any {
    // This is handled by normalize.ts
    return raw as any;
  }
}
