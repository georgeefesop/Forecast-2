/**
 * Normalize raw event data to canonical format
 */

import type { CanonicalEvent, RawEventStub, RawEventDetail } from './types';
import { parseDate, parseDateRange, deriveExternalId } from './utils';

const DEFAULT_CITY = 'Limassol';
const DEFAULT_TIMEZONE = 'Europe/Nicosia';

export function normalizeEvent(
  stub: RawEventStub,
  detail?: RawEventDetail,
  sourceName: string,
  sourceUrl: string
): CanonicalEvent {
  // Merge stub and detail
  const raw = { ...stub, ...detail };

  // Parse dates - try to extract date range if present
  // Priority: detail.startAt > detail date text > stub.dateHint
  let startAt: Date;
  let endAt: Date | undefined = raw.endAt;
  
  if (raw.startAt) {
    // Date already parsed from detail page
    startAt = raw.startAt;
  } else if (stub.dateHint) {
    // Try to parse dateHint from list page
    // Extract year from URL for context (most reliable)
    const urlYearMatch = stub.url.match(/\b(202[4-6])\b/);
    const urlYear = urlYearMatch ? parseInt(urlYearMatch[1]) : undefined;
    
    // Try to parse as range first
    const rangeResult = parseDateRange(stub.dateHint, urlYear);
    if (rangeResult) {
      startAt = rangeResult.start;
      if (rangeResult.end && !endAt) {
        endAt = rangeResult.end;
      }
    } else {
      // Fall back to single date - use URL year as context
      const parsed = parseDate(stub.dateHint, undefined, urlYear);
      if (!parsed) {
        // Try to extract just the first part if it's a range
        const firstPart = stub.dateHint.split(/[-–]/)[0].trim();
        const retryParsed = parseDate(firstPart, undefined, urlYear);
        if (retryParsed) {
          startAt = retryParsed;
        } else {
          throw new Error(`Could not parse date: ${stub.dateHint}`);
        }
      } else {
        startAt = parsed;
      }
    }
  } else {
    // If no date hint, reject this event - we need a date
    throw new Error(`No date available for event: ${stub.url}`);
  }
  
  // Validate date is not too far in the past (reject events older than 1 day)
  // This allows events that just happened to be shown, but filters out old events
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (startAt < oneDayAgo) {
    // Event is more than 1 day in the past - reject it during ingestion
    // (Users can still see past events via filter, but we don't want to ingest old events)
    throw new Error(`Event date is too far in the past: ${startAt.toISOString()} for ${stub.url}`);
  }

  // Generate external ID
  const sourceExternalId = deriveExternalId(sourceUrl);

  // Normalize venue
  const venue = raw.venue ? {
    name: raw.venue.name.trim(),
    address: raw.venue.address?.trim(),
  } : undefined;

  // Normalize description (limit length, clean HTML)
  let description = raw.description;
  if (description) {
    // Remove HTML tags (simple regex, use proper parser in production)
    description = description
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Limit to 500 chars
    if (description.length > 500) {
      description = description.substring(0, 497) + '...';
    }
  }

  return {
    title: raw.title.trim(),
    description,
    startAt,
    endAt,
    city: DEFAULT_CITY,
    venue,
    address: raw.address?.trim(),
    category: raw.category?.trim(),
    tags: raw.tags?.filter(Boolean),
    priceMin: raw.priceMin,
    priceMax: raw.priceMax,
    currency: raw.currency || 'EUR',
    imageUrl: raw.imageUrl || stub.imageUrl,
    ticketUrl: raw.ticketUrl,
    sourceName,
    sourceUrl,
    sourceExternalId,
  };
}
