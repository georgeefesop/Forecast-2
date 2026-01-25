/**
 * Limassol Marina - What's On adapter
 * https://www.limassolmarina.com/whats-on
 */

import type { SourceAdapter, RawEventStub, RawEventDetail } from '../types';
import { fetchWithRetry } from '../utils';
import { load } from 'cheerio';
import { parseDate } from '../utils';

export class LimassolMarinaAdapter implements SourceAdapter {
  name = 'limassol_marina';
  private baseUrl = 'https://www.limassolmarina.com/whats-on';

  async list(): Promise<RawEventStub[]> {
    const response = await fetchWithRetry(this.baseUrl);
    const html = await response.text();
    const $ = load(html);

    const stubs: RawEventStub[] = [];

    // Find event items - try various selectors
    $('.event, .event-item, article, .whats-on-item, [class*="event"]').each((_, el) => {
      const $el = $(el);
      
      // Find link
      const link = $el.find('a').first().attr('href') || $el.attr('href');
      if (!link) return;

      // Make absolute URL - handle relative paths properly
      let url: string;
      if (link.startsWith('http')) {
        url = link;
      } else if (link.startsWith('/')) {
        try {
          const baseUrlObj = new URL(this.baseUrl);
          url = `${baseUrlObj.protocol}//${baseUrlObj.host}${link}`;
        } catch {
          url = new URL(link, this.baseUrl).href;
        }
      } else {
        url = new URL(link, this.baseUrl).href;
      }
      
      // Clean up duplicate path segments
      url = url.replace(/([^:]\/)\/+/g, '$1');

      // Extract title - prioritize heading elements, avoid date-like patterns
      let title = $el.find('h1, h2, h3, h4, .title, .event-title, .name').first().text().trim();
      
      // If title looks like a date range (e.g., "25 - 26"), try to find a better title
      // But allow generic titles through - detail() will fix them
      if (title.match(/^\d{1,2}\s*[-–]\s*\d{1,2}/)) {
        // Try alternative selectors
        const altTitle = $el.find('.event-name, [class*="name"], [class*="title"]').not('h1, h2, h3, h4').first().text().trim();
        if (altTitle && altTitle.length > 3 && !altTitle.match(/^\d{1,2}\s*[-–]/)) {
          title = altTitle;
        } else {
          // Try to get text from the link itself
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

      // Extract date - try multiple strategies
      let dateText = $el.find('.date, .event-date, time, [class*="date"], [class*="when"]')
        .first()
        .text()
        .trim();
      
      // Also try datetime attribute
      if (!dateText) {
        dateText = $el.find('time[datetime]').attr('datetime') ||
                   $el.find('[datetime]').attr('datetime');
      }
      
      // Try to extract from the element's text content (look for date patterns)
      if (!dateText) {
        const elementText = $el.text();
        // Look for date patterns in the element text
        const datePattern = elementText.match(/\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*20\d{2}?)\b/i) ||
                          elementText.match(/\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s*20\d{2}?)\b/i) ||
                          elementText.match(/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]20\d{2}?)\b/);
        if (datePattern && datePattern[1]) {
          dateText = datePattern[1];
        }
      }

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

    // Fallback: find all links that might be events
    if (stubs.length === 0) {
      $('a[href*="whats-on"], a[href*="event"]').each((_, el) => {
        const $link = $(el);
        const url = $link.attr('href');
        if (!url) return;

        const fullUrl = url.startsWith('http') ? url : new URL(url, this.baseUrl).href;
        const title = $link.text().trim();
        
        if (title && title.length > 3 && !title.match(/^(read more|learn more|view|see all)$/i)) {
          stubs.push({
            title,
            url: fullUrl,
          });
        }
      });
    }

    return stubs.slice(0, 50);
  }

  async detail(stub: RawEventStub): Promise<RawEventDetail> {
    const response = await fetchWithRetry(stub.url);
    const html = await response.text();
    const $ = load(html);

    // Extract title from detail page - prioritize actual event titles
    let title = stub.title;
    const detailTitle = $('h1, h2.event-title, .event-name, [class*="event-title"], [class*="event-name"]')
      .first()
      .text()
      .trim();
    
    // If detail page has a better title (not a date range), use it
    if (detailTitle && detailTitle.length > 3 && !detailTitle.match(/^\d{1,2}\s*[-–]\s*\d{1,2}/)) {
      title = detailTitle;
    }
    
    // Extract year from page content (for date parsing context)
    const pageText = $('body').text();
    const yearMatch = pageText.match(/\b(202[4-6])\b/); // Look for 2024, 2025, or 2026
    const contextYear = yearMatch ? parseInt(yearMatch[1]) : undefined;

    // Extract date/time FIRST - try multiple sources and strategies
    // Priority: explicit date elements > dateHint from list > extracted from page text
    let dateText = $('.date, .event-date, time, [datetime], [class*="date"], .event-info, .event-details')
      .first()
      .text()
      .trim() || $('[datetime]').first().attr('datetime');
    
    // Try more specific selectors
    if (!dateText) {
      dateText = $('time[datetime]').attr('datetime') ||
                 $('[data-date]').attr('data-date') ||
                 $('.when, .event-when, .date-time, .event-time').first().text().trim();
    }
    
    // Also try to get date from stub.dateHint if detail page doesn't have it
    if (!dateText && stub.dateHint) {
      dateText = stub.dateHint;
    }
    
    // If still no date, try to extract from entire page content
    if (!dateText) {
      const pageText = $('body').text();
      // Look for common date patterns with years - be more aggressive
      const datePatterns = [
        /\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+20\d{2})\b/i,
        /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+20\d{2})\b/i,
        /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]20\d{2})\b/,
        /\b(20\d{2}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/, // YYYY-MM-DD format
        // Also try without year (will use context year)
        /\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*)\b/i,
      ];
      
      for (const pattern of datePatterns) {
        const matches = pageText.match(pattern);
        if (matches && matches[1]) {
          dateText = matches[1];
          break;
        }
      }
    }
    
    // Extract year from URL or title if present (e.g., "limassol-motion-2024", "come-out-2024")
    // This is critical for events that have years in their URLs
    let urlYear: number | undefined;
    const urlYearMatch = stub.url.match(/\b(202[4-6])\b/) || title.match(/\b(202[4-6])\b/);
    if (urlYearMatch) {
      urlYear = parseInt(urlYearMatch[1]);
    }
    
    // Use URL year as context if no year found in page
    // URL year takes precedence as it's more reliable
    const finalContextYear = urlYear || contextYear;
    
    const startAt = dateText ? parseDate(dateText, undefined, finalContextYear) : undefined;
    
    // Extract description
    const description = $('.content, .description, .event-description, article p, main p')
      .first()
      .text()
      .trim()
      .substring(0, 500);

    // Venue is always Limassol Marina
    const venue = { name: 'Limassol Marina' };

    // Extract address (usually the marina address)
    const address = $('.address, [class*="address"], .location').first().text().trim() ||
                    'Limassol Marina, Limassol, Cyprus';

    // Extract category
    const category = $('.category, .tag, [class*="category"]').first().text().trim();

    // Extract ticket URL
    const ticketUrl = $('a[href*="ticket"], a[href*="book"], .ticket-link a, .book-now a')
      .first()
      .attr('href');

    // Extract image
    const imageUrl = $('img[src*="event"], .event-image img, article img, .hero img')
      .first()
      .attr('src') || stub.imageUrl;

    return {
      title,
      description,
      startAt,
      venue,
      address,
      category,
      imageUrl: imageUrl ? new URL(imageUrl, stub.url).href : undefined,
      ticketUrl: ticketUrl ? new URL(ticketUrl, stub.url).href : undefined,
    };
  }

  mapToCanonical(raw: RawEventStub & Partial<RawEventDetail>): any {
    return raw as any;
  }
}
