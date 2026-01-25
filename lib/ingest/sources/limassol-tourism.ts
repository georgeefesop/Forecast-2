/**
 * Limassol Tourism Board - Events Calendar adapter
 * https://www.limassoltourism.com/en/blog/events-calendar/?pagenum=1
 */

import type { SourceAdapter, RawEventStub, RawEventDetail } from '../types';
import { fetchWithRetry } from '../utils';
import { load } from 'cheerio';
import { parseDate } from '../utils';

export class LimassolTourismAdapter implements SourceAdapter {
  name = 'limassol_tourism';
  private baseUrl = 'https://www.limassoltourism.com/en/blog/events-calendar/';
  private maxPages = 5;

  async list(): Promise<RawEventStub[]> {
    const stubs: RawEventStub[] = [];

    // Fetch first 5 pages
    for (let page = 1; page <= this.maxPages; page++) {
      try {
        const url = `${this.baseUrl}?pagenum=${page}`;
        const response = await fetchWithRetry(url);
        const html = await response.text();
        const $ = load(html);

        let pageHasEvents = false;

        // Find event items
        $('.event, .event-item, article, .blog-post, [class*="event"], [class*="post"]').each((_, el) => {
          const $el = $(el);
          
          const link = $el.find('a').first().attr('href') || $el.attr('href');
          if (!link) return;
          
          // Filter out invalid URLs (list pages, not event pages)
          if (link.includes('/events/') && !link.match(/\/events\/[^\/]+$/)) {
            return; // Skip list pages like /events/ or /events/?page=1
          }

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

          let title = $el.find('h2, h3, h4, .title, .post-title, .entry-title').first().text().trim();
          
          // If title looks like a date range, try to find a better title
          // But allow generic titles like "Agenda" or "Events" through - detail() will fix them
          if (title.match(/^\d{1,2}\s*[-–]\s*\d{1,2}/)) {
            const altTitle = $el.find('.event-name, [class*="name"], [class*="title"]').not('h2, h3, h4').first().text().trim();
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

          const dateText = $el.find('.date, .event-date, time, .published, [class*="date"]')
            .first()
            .text()
            .trim();

          const imageUrl = $el.find('img').first().attr('src') || 
                          $el.find('img').first().attr('data-src');

          stubs.push({
            title,
            url,
            dateHint: dateText,
            imageUrl: imageUrl ? new URL(imageUrl, this.baseUrl).href : undefined,
          });

          pageHasEvents = true;
        });

        // If no events found, try generic link approach
        if (!pageHasEvents) {
            $('a[href*="event"], a[href*="calendar"]').each((_, el) => {
            const $link = $(el);
            const url = $link.attr('href');
            if (!url) return;
            
            // Filter out invalid URLs (list pages, not event pages)
            if (url.includes('/events/') && !url.match(/\/events\/[^\/]+$/)) {
              return; // Skip list pages
            }

            const fullUrl = url.startsWith('http') ? url : new URL(url, this.baseUrl).href;
            const title = $link.text().trim() || $link.find('h1, h2, h3').first().text().trim();
            
            if (title && title.length > 3) {
              stubs.push({
                title,
                url: fullUrl,
              });
              pageHasEvents = true;
            }
          });
        }

        // If page has no events, stop pagination
        if (!pageHasEvents) {
          break;
        }

        // Rate limit between pages
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error: any) {
        console.warn(`[${this.name}] Error fetching page ${page}:`, error.message);
        // Continue to next page
      }
    }

    return stubs.slice(0, 100); // Limit total
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
      '.post-title',
      '.entry-title',
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
          !detailTitle.match(/^(agenda|events?|limassol tourism|events calendar)$/i) &&
          detailTitle.length < 200) { // Reasonable title length
        title = detailTitle;
        break;
      }
    }
    
    // If still generic, try extracting from description first sentence
    if ((title.match(/^(agenda|events?)$/i) || title.length < 5) && $('.content, .entry-content, .post-content, article p').length > 0) {
      const firstPara = $('.content, .entry-content, .post-content, article p').first().text().trim();
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
    const description = $('.content, .entry-content, .post-content, article p, .description, main p')
      .first()
      .text()
      .trim()
      .substring(0, 500);

    // Extract date/time - try multiple sources
    let dateText = $('.date, .event-date, time, .published, [datetime], [class*="date"]')
      .first()
      .text()
      .trim() || $('[datetime]').first().attr('datetime');
    
    // Also try to get date from stub.dateHint if detail page doesn't have it
    if (!dateText && stub.dateHint) {
      dateText = stub.dateHint;
    }
    
    // Extract year from page content, URL, or title for context
    const pageText = $('body').text();
    const yearMatch = pageText.match(/\b(202[4-6])\b/) || 
                      stub.url.match(/\b(202[4-6])\b/) ||
                      title.match(/\b(202[4-6])\b/);
    const contextYear = yearMatch ? parseInt(yearMatch[1]) : undefined;
    
    const startAt = dateText ? parseDate(dateText, undefined, contextYear) : undefined;

    // Extract venue
    const venueName = $('.venue, .location, [class*="venue"], [class*="location"]')
      .first()
      .text()
      .trim();
    const venue = venueName ? { name: venueName } : undefined;

    // Extract address
    const address = $('.address, [class*="address"]').first().text().trim();

    // Extract category/tags
    const category = $('.category, .tag, [rel="tag"], .post-category').first().text().trim();
    const tags = $('.tags a, [rel="tag"], .post-tags a')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean);

    // Extract ticket URL
    const ticketUrl = $('a[href*="ticket"], a[href*="book"], .ticket-link a').first().attr('href');

    // Extract image
    const imageUrl = $('img[src*="event"], .event-image img, article img, .post-image img, .featured-image img')
      .first()
      .attr('src') || stub.imageUrl;

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
    };
  }

  mapToCanonical(raw: RawEventStub & Partial<RawEventDetail>): any {
    return raw as any;
  }
}
