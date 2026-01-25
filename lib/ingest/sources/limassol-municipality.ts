/**
 * Limassol Municipality Events Calendar adapter
 * https://www.limassol.org.cy/en/calendar
 */

import type { SourceAdapter, RawEventStub, RawEventDetail } from '../types';
import { fetchWithRetry } from '../utils';
import { load } from 'cheerio';
import { parseDate } from '../utils';

export class LimassolMunicipalityAdapter implements SourceAdapter {
  name = 'limassol_municipality';
  // Use the English calendar page (limassol.org.cy)
  private baseUrl = 'https://www.limassol.org.cy/en/calendar';

  async list(): Promise<RawEventStub[]> {
    const stubs: RawEventStub[] = [];

    try {
      const response = await fetchWithRetry(this.baseUrl);
      const html = await response.text();
      const $ = load(html);

      // Find event items - the structure is: div.article-item-list
      $('.article-item-list').each((_, el) => {
        const $el = $(el);

        // Extract title from h4 inside a.btn-link
        const titleLink = $el.find('a.btn-link').first();
        const title = titleLink.find('h4').first().text().trim();

        if (!title || title.length < 3) {
          return; // Skip if no valid title
        }

        // Validate title - must be meaningful (not generic navigation text)
        const titleLower = title.toLowerCase().trim();

        // Exact matches for generic titles that should be skipped
        const exactGenericTitles = [
          'δείτε άλλες εκδηλώσεις',
          'see other events',
          'contact',
          'contact us',
          'επικοινωνία',
          'home',
          'αρχική',
          'about',
          'σχετικά',
          'read more',
          'περισσότερα',
          'more',
          'view',
          'see',
        ];

        if (exactGenericTitles.includes(titleLower)) {
          return; // Skip exact matches
        }

        // Skip if title is too short (likely navigation, not an event)
        if (title.length < 10) {
          return;
        }

        // Skip if title starts with generic navigation words
        if (titleLower.match(/^(contact|about|home|services|history|politismos|more|view|see|read)/)) {
          return;
        }

        // Extract date from h5 - REQUIRED for valid events
        const dateText = $el.find('h5').first().text().trim();
        if (!dateText || !dateText.match(/\d{2}-\d{2}-\d{4}/)) {
          console.warn(`[${this.name}] Skipping event - no valid date: ${title.substring(0, 50)}`);
          return; // Skip if no valid date format
        }

        // Extract URL from the title link (or any link in the item)
        const url = titleLink.attr('href') ||
          $el.find('a.btn-link').first().attr('href') ||
          $el.find('a[href*="/event/"]').first().attr('href');

        if (!url) return;

        // CRITICAL: Only process actual event pages (contain /event/ in URL)
        if (!url.includes('/event/')) {
          return; // Skip non-event links
        }

        // Additional validation: ensure the URL path after /event/ is meaningful
        // Generic pages often have very short or generic slugs
        const eventSlug = url.split('/event/')[1]?.split('/')[0]?.split('?')[0];
        if (!eventSlug || eventSlug.length < 5) {
          return; // Skip if slug is too short (likely not a real event)
        }

        // Skip if slug contains generic words
        const slugLower = eventSlug.toLowerCase();
        if (slugLower.match(/(contact|about|home|services|history|politismos|more|view|see)/)) {
          return;
        }

        // Make absolute URL
        let fullUrl: string;
        if (url.startsWith('http')) {
          fullUrl = url;
        } else if (url.startsWith('/')) {
          try {
            const baseUrlObj = new URL(this.baseUrl);
            fullUrl = `${baseUrlObj.protocol}//${baseUrlObj.host}${url}`;
          } catch {
            fullUrl = new URL(url, this.baseUrl).href;
          }
        } else {
          fullUrl = new URL(url, this.baseUrl).href;
        }

        // Clean up duplicate path segments
        fullUrl = fullUrl.replace(/([^:]\/)\/+/g, '$1');

        // Extract image from img.img-responsive
        const imageUrl = $el.find('img.img-responsive').first().attr('src');

        stubs.push({
          title,
          url: fullUrl,
          dateHint: dateText || undefined,
          imageUrl: imageUrl ? new URL(imageUrl, this.baseUrl).href : undefined,
        });

        console.log(`[${this.name}] ✅ Found event #${stubs.length + 1}: "${title.substring(0, 80)}" | Date: ${dateText} | URL: ${fullUrl.substring(0, 80)}`);
      });

      console.log(`[${this.name}] 📊 Total stubs found: ${stubs.length}`);

      // Check for pagination - look for "next" links
      // TODO: Handle pagination if needed (for now, just get first page)

    } catch (error: any) {
      console.warn(`[${this.name}] Error fetching list page:`, error.message);
    }

    return stubs.slice(0, 100); // Limit to 100 events
  }

  async detail(stub: RawEventStub): Promise<RawEventDetail> {
    const response = await fetchWithRetry(stub.url);
    const html = await response.text();
    const $ = load(html);

    // ALWAYS use stub.title from list page - NEVER override with generic titles
    // The detail page often has generic navigation titles like "Contact Us"
    let title = stub.title;
    const detailTitle = $('h1').first().text().trim();

    // List of generic titles that should NEVER override the list page title
    const genericTitles = [
      'contact', 'contact us', 'επικοινωνία',
      'about', 'σχετικά',
      'home', 'αρχική',
      'services', 'υπηρεσίες',
      'more', 'view', 'see', 'read',
    ];

    const detailTitleLower = detailTitle.toLowerCase().trim();
    const isGeneric = genericTitles.some(g => detailTitleLower === g || detailTitleLower.includes(g));

    // NEVER override if detail title is generic - ALWAYS keep stub.title
    if (isGeneric) {
      console.log(`[${this.name}] ⚠️ Rejecting generic detail title "${detailTitle}" - keeping list title "${stub.title.substring(0, 60)}"`);
    } else if (detailTitle &&
      detailTitle.length >= 20 && // Must be substantial
      detailTitle.length > stub.title.length && // Must be longer than list title
      !detailTitle.match(/^(contact|about|home|services|more|view|see|read|επικοινωνία|αρχική)/i)) {
      // Only override if detail title is clearly better
      title = detailTitle;
      console.log(`[${this.name}] ✅ Using detail title "${detailTitle.substring(0, 50)}" (longer than list title)`);
    } else {
      // Keeping stub.title - log for debugging
      console.log(`[${this.name}] ✅ Keeping list title "${stub.title.substring(0, 60)}" (detail: "${detailTitle?.substring(0, 40) || 'none'}")`);
    }

    // Extract description - logic updated based on actual HTML structure
    // The content is usually in a div that contains the h2 title
    let description = '';
    const titleEl = $('h2.margin-top-0').first();

    if (titleEl.length > 0) {
      // We found the main title, the content is in the same container
      const container = titleEl.parent();

      // Remove known non-description elements to get clean text
      const contentClone = container.clone();
      contentClone.find('h2, .row, .max-height-450, .list-inline, script, style').remove();

      description = contentClone.text().trim();

      // Clean up whitespace
      description = description.replace(/\s+/g, ' ').trim();
    }

    // Fallback if the specific structure isn't found
    if (!description) {
      description = $('.content, .event-description, .description, article p, main p, .entry-content')
        .not('.footer *, .header *, .nav *, .menu *') // Exclude common structure areas
        .first()
        .text()
        .trim();
    }

    // Limit description length and ensure we don't pick up footer
    if (description && (description.length > 2000 || description.includes('OUR MUNICIPALITY'))) {
      // If description is massive or looks like footer, try to be more restrictive
      const pText = titleEl.parent().find('p').not('.col-md-5 p').text().trim();
      if (pText) description = pText;
    }

    if (description && description.length > 500) {
      description = description.substring(0, 497) + '...';
    }

    // Extract date/time - priority: h5 tag (list page style) or specific col-md-5 p (detail page style)
    let dateText = $('h5').first().text().trim();

    if (!dateText) {
      // Look for the date in the specific layout: col-md-5 under the title row
      const dateEl = titleEl.siblings('.row').find('.col-md-5 p').first();
      if (dateEl.length > 0) {
        dateText = dateEl.text().trim();
      }
    }

    // Fallback to stub.dateHint
    if (!dateText && stub.dateHint) {
      dateText = stub.dateHint;
    }

    // Try other selectors as fallback
    if (!dateText) {
      dateText = $('.date, .event-date, time, [datetime], [class*="date"]')
        .first()
        .text()
        .trim() || $('[datetime]').first().attr('datetime');
    }

    // Parse the date
    let startAt: Date | undefined;
    let endAt: Date | undefined;

    if (dateText) {
      // Try multi-day format first: "19-03-2026 08:30 - 20-03-2026 19:30"
      const multiDayMatch = dateText.match(/(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})\s*[-–]\s*(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})/);
      if (multiDayMatch) {
        const [, startDay, startMonth, startYear, startHour, startMin, endDay, endMonth, endYear, endHour, endMin] = multiDayMatch;
        startAt = new Date(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay), parseInt(startHour), parseInt(startMin));
        endAt = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay), parseInt(endHour), parseInt(endMin));
      } else {
        // Try single day with time range: "31-01-2026 10:00 - 12:00"
        const singleDayTimeMatch = dateText.match(/(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})\s*[-–]\s*(\d{2}):(\d{2})/);
        if (singleDayTimeMatch) {
          const [, day, month, year, startHour, startMin, endHour, endMin] = singleDayTimeMatch;
          startAt = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(startHour), parseInt(startMin));
          endAt = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(endHour), parseInt(endMin));
        } else {
          // Try date only: "31-01-2026"
          const dateOnlyMatch = dateText.match(/(\d{2})-(\d{2})-(\d{4})/);
          if (dateOnlyMatch) {
            const [, day, month, year] = dateOnlyMatch;
            startAt = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          } else {
            // Fallback to parseDate utility
            startAt = parseDate(dateText);
          }
        }
      }
    }

    // Extract venue - try multiple strategies
    let venueName = $('.venue, .location, [class*="venue"], [class*="location"], .address')
      .first()
      .text()
      .trim();

    // Use fallback matching on body text if explicit venue not found
    if (!venueName || venueName.length < 3) {
      const pageText = $('body').text();
      const venuePatterns = [
        /(?:στο|at|@)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Museum|Theatre|Center|Centre|Marina|Park|Studio|Warehouse))/i,
        /(?:στο|at|@)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Μουσείο|Θέατρο|Κέντρο|Πάρκο))/i,
      ];

      for (const pattern of venuePatterns) {
        const match = pageText.match(pattern);
        if (match && match[1]) {
          venueName = match[1].trim();
          break;
        }
      }
    }

    const venue = venueName && venueName.length > 3 ? { name: venueName } : undefined;

    // Extract address
    const address = $('.address, [class*="address"]').first().text().trim();

    // Extract phone/contact info
    const phoneText = $('.phone, [class*="phone"], [class*="contact"]')
      .first()
      .text()
      .trim();

    // Extract category/tags - look in the specific btn-link area
    let category = titleEl.siblings('.row').find('.col-md-7 a.btn-link').text().trim();

    if (!category) {
      category = $('.category, .tag, [rel="tag"], [class*="category"]')
        .first()
        .text()
        .trim();
    }

    const tags = $('.tags a, [rel="tag"]')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean);

    // Extract ticket URL - Explicitly exclude social share links
    const ticketUrl = $('a[href*="ticket"], a[href*="book"], .ticket-link a')
      .not('[href*="facebook.com"], [href*="twitter.com"], [href*="linkedin.com"], [href*="sharer"]')
      .first()
      .attr('href');

    // Extract image
    const imageUrl = $('img[src*="event"], .event-image img, article img, .featured-image img')
      .first()
      .attr('src') || stub.imageUrl;

    return {
      title,
      description,
      startAt,
      endAt,
      venue,
      address: address || phoneText ? `${address || ''} ${phoneText || ''}`.trim() : undefined,
      category,
      tags: tags.length > 0 ? tags : undefined,
      imageUrl: imageUrl ? new URL(imageUrl, stub.url).href : undefined,
      ticketUrl: ticketUrl ? new URL(ticketUrl, stub.url).href : undefined,
    };
  }

  mapToCanonical(raw: RawEventStub & Partial<RawEventDetail>): any {
    // This is handled by normalize.ts
    return raw as any;
  }
}
