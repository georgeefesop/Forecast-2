
import * as cheerio from 'cheerio';
import { fetchWithRetry } from '../utils';
import type { SourceAdapter, RawEventStub, RawEventDetail } from '../types';

/**
 * SoldOut TicketBox calendar adapter
 * https://www.soldoutticketbox.com/en/calendar
 */
export class SoldOutTicketBoxAdapter implements SourceAdapter {
  name = 'soldout_ticketbox';
  baseUrl = 'https://www.soldoutticketbox.com';

  async list(): Promise<RawEventStub[]> {
    const response = await fetchWithRetry(`${this.baseUrl}/en/calendar`);
    const html = await response.text();
    const $ = cheerio.load(html);
    const stubs: RawEventStub[] = [];

    // The calendar is a table. Events are in "moreSpeckModal" divs inside td elements
    $('.moreSpeckModal p a').each((_, element) => {
      const el = $(element);
      const urlPath = el.attr('href');

      if (urlPath) {
        const fullUrl = urlPath.startsWith('http') ? urlPath : `${this.baseUrl}${urlPath}`;

        // Text format: "DD/MM/YYYY HH:mm TITLE | VENUE"
        // Example: "03/01/2026 20:00 TO GALA | THEATRO DENTRO NICOSIA"
        const text = el.text().trim();

        // Regex to parse: Date Time Title | Venue
        const match = text.match(/^(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2})\s+(.+?)\s+\|\s+(.+)$/);

        let title = text;
        let dateHint = text;
        let venue = '';

        if (match) {
          const [_, dateStr, timeStr, titleStr, venueStr] = match;
          title = titleStr.trim();
          venue = venueStr.trim();
          dateHint = `${dateStr} ${timeStr}`;
        }

        stubs.push({
          url: fullUrl,
          title: title,
          dateHint: dateHint,
          imageUrl: '',
          // @ts-ignore - passing extra data for detail
          location: venue
        } as RawEventStub);
      }
    });

    return stubs;
  }

  async detail(stub: RawEventStub): Promise<RawEventDetail> {
    const location = (stub as any).location;
    const dateHint = stub.dateHint;

    // Fetch the actual detail page
    const response = await fetchWithRetry(stub.url);
    const html = await response.text();
    const $ = cheerio.load(html);

    // Try to find image
    // Common selectors: og:image, .event-image, main img
    let imageUrl = $('meta[property="og:image"]').attr('content');
    if (!imageUrl) {
      imageUrl = $('.event_page_left img').attr('src'); // Try strict selector from soldout structure if known, or generic
      if (!imageUrl) imageUrl = $('img.img-responsive').first().attr('src');
    }
    // Fix relative URLs
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `${this.baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }

    // Try to find description
    // SoldOut usually has description in a div with text
    let description = $('.event_desc').text().trim();
    if (!description) {
      description = $('.col-md-8').text().trim(); // Fallback to main column
    }
    // Clean up description (remove excessive whitespace)
    description = description.replace(/[\n\t]+/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

    let startAt: Date | undefined;
    if (dateHint) {
      // Parse "DD/MM/YYYY HH:mm"
      const parts = dateHint.split(' ');
      if (parts.length >= 2) {
        const datePart = parts[0];
        const timePart = parts[1];
        const [day, month, year] = datePart.split('/');
        const [hour, minute] = timePart.split(':');

        if (day && month && year && hour && minute) {
          startAt = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
        }
      }
    }

    // Infer category from title/desc/meta
    // SoldOut might have a category entry or we use our keyword logic
    let category = 'Arts & Theatre';
    const pageText = ($('body').text() + stub.title).toLowerCase();

    if (pageText.includes('music') || pageText.includes('concert') || pageText.includes('live')) category = 'Music';
    else if (pageText.includes('theatre') || pageText.includes('play') || pageText.includes('stage')) category = 'Theatre';
    else if (pageText.includes('sport') || pageText.includes('marathon') || pageText.includes('race')) category = 'Sports';
    else if (pageText.includes('family') || pageText.includes('kids')) category = 'Family';

    return {
      title: stub.title,
      description: description || 'See source for details',
      startAt: startAt,
      venue: location ? { name: location } : undefined,
      category: category,
      imageUrl: imageUrl,
      tags: [category]
    };
  }

  mapToCanonical(raw: RawEventStub & Partial<RawEventDetail>): any {
    // Infer city from venue if possible
    let city = 'Cyprus';
    const venueLower = (raw.venue?.name || '').toLowerCase();
    if (venueLower.includes('nicosia') || venueLower.includes('lefkosia')) city = 'Nicosia';
    else if (venueLower.includes('limassol') || venueLower.includes('lemesos')) city = 'Limassol';
    else if (venueLower.includes('larnaca') || venueLower.includes('larnaka')) city = 'Larnaca';
    else if (venueLower.includes('paphos') || venueLower.includes('pafos')) city = 'Paphos';
    else if (venueLower.includes('ayia napa')) city = 'Ayia Napa';

    return {
      title: raw.title,
      description: raw.description,
      startAt: raw.startAt || new Date(),
      city: city,
      venue: raw.venue,
      category: raw.category,
      tags: raw.tags,
      imageUrl: raw.imageUrl,
      ticketUrl: raw.url,
      sourceName: this.name,
      sourceUrl: raw.url,
      sourceExternalId: raw.url
    };
  }
}
