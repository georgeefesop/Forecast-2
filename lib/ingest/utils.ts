/**
 * Utility functions for event ingestion
 */

import { createHash } from 'crypto';

/**
 * Generate a stable external ID from a URL
 */
export function deriveExternalId(url: string): string {
  try {
    const urlObj = new URL(url);
    // Use pathname + search params as stable ID
    const path = urlObj.pathname + urlObj.search;
    return createHash('md5').update(path).digest('hex').substring(0, 16);
  } catch {
    // Fallback: hash the entire URL
    return createHash('md5').update(url).digest('hex').substring(0, 16);
  }
}

/**
 * Normalize title for deduplication
 */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Check if two events are likely the same (fuzzy matching)
 */
export function areEventsSimilar(
  event1: { title: string; startAt: Date; city: string; venue?: { name?: string } },
  event2: { title: string; startAt: Date; city: string; venue?: { name?: string } }
): boolean {
  // Same city required
  if (event1.city.toLowerCase() !== event2.city.toLowerCase()) {
    return false;
  }

  // Start times within reasonable window (2 hours for single events, or if dates overlap for multi-day)
  const timeDiff = Math.abs(event1.startAt.getTime() - event2.startAt.getTime());
  // Allow up to 2 hours difference, or if events are on the same day
  const sameDay = event1.startAt.toDateString() === event2.startAt.toDateString();
  if (!sameDay && timeDiff > 2 * 60 * 60 * 1000) {
    return false;
  }

  // Similar titles (normalized)
  const title1 = normalizeTitle(event1.title);
  const title2 = normalizeTitle(event2.title);
  
  // Don't match if both titles are generic (likely different events with bad titles)
  const genericTitles = ['agenda', 'events', 'event', 'whats on', 'what\'s on'];
  const isGeneric1 = genericTitles.includes(title1) || title1.length < 5;
  const isGeneric2 = genericTitles.includes(title2) || title2.length < 5;
  
  if (isGeneric1 && isGeneric2) {
    // Both are generic - don't consider them duplicates unless they're from the same source
    return false;
  }
  
  // Exact match after normalization
  if (title1 === title2) {
    return true;
  }

  // Check if one title contains the other (for partial matches)
  // But skip if either title is too generic
  if (title1.length > 10 && title2.length > 10 && !isGeneric1 && !isGeneric2) {
    if (title1.includes(title2) || title2.includes(title1)) {
      // Also check venue if available
      if (event1.venue?.name && event2.venue?.name) {
        const venue1 = normalizeTitle(event1.venue.name);
        const venue2 = normalizeTitle(event2.venue.name);
        return venue1 === venue2 || venue1.includes(venue2) || venue2.includes(venue1);
      }
      return true;
    }
  }

  return false;
}

/**
 * Parse date string with common formats
 * Handles Greek/English month names, date ranges, and various formats
 * Tries to extract year from context if not provided
 */
export function parseDate(dateStr: string, timeStr?: string, contextYear?: number): Date | null;
export function parseDate(dateStr: string, timeStr?: string): Date | null;
export function parseDate(dateStr: string, timeStr?: string, contextYear?: number): Date | null {
  if (!dateStr) return null;

  // Clean up the date string
  let cleaned = dateStr.trim();
  
  // Try to extract year from the date string itself first
  let extractedYear: number | undefined;
  const yearMatch = cleaned.match(/\b(20\d{2})\b/);
  if (yearMatch) {
    // Year found in string - use it and prioritize it
    extractedYear = parseInt(yearMatch[1]);
    // Don't remove year - let the pattern matching handle it
  }

  // Handle date ranges (e.g., "14 - 28 Dec - Dec" or "25 - 04 Oct - Nov")
  // Extract the start date (first date in range)
  const rangeMatch = cleaned.match(/^(\d{1,2})\s*[-–]\s*(\d{1,2})\s+(\w+)\s*[-–]\s*(\w+)/i);
  if (rangeMatch) {
    const [, startDay, , startMonth] = rangeMatch;
    // Use the start date
    cleaned = `${startDay} ${startMonth}`;
  } else {
    // Handle formats like "14 - 28 Dec" (simpler range)
    const simpleRangeMatch = cleaned.match(/^(\d{1,2})\s*[-–]\s*(\d{1,2})\s+(\w+)/i);
    if (simpleRangeMatch) {
      const [, startDay, , month] = simpleRangeMatch;
      cleaned = `${startDay} ${month}`;
    }
  }

  // Try ISO format first
  const isoDate = new Date(cleaned);
  if (!isNaN(isoDate.getTime())) {
    // If year is before 2020, it's likely a parsing error
    if (isoDate.getFullYear() < 2020) {
      const now = new Date();
      const parsedMonth = isoDate.getMonth();
      const parsedDay = isoDate.getDate();
      const currentYear = now.getFullYear();
      
      // Try current year first
      const testDate = new Date(currentYear, parsedMonth, parsedDay);
      const monthsFromNow = (testDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
      
      // If date this year is more than 6 months in the past, try next year
      // Otherwise use current year
      let year = currentYear;
      if (monthsFromNow < -6) {
        year = currentYear + 1;
      }
      
      return new Date(year, parsedMonth, parsedDay);
    }
    return isoDate;
  }

  // Map month abbreviations and full names
  const monthMap: Record<string, number> = {
    'jan': 0, 'january': 0,
    'feb': 1, 'february': 1,
    'mar': 2, 'march': 2,
    'apr': 3, 'april': 3,
    'may': 4,
    'jun': 5, 'june': 5,
    'jul': 6, 'july': 6,
    'aug': 7, 'august': 7,
    'sep': 8, 'september': 8, 'sept': 8,
    'oct': 9, 'october': 9,
    'nov': 10, 'november': 10,
    'dec': 11, 'december': 11,
  };

  // Map Greek month names to English
  const greekMonths: Record<string, string> = {
    'ιανουαρίου': 'january', 'ιαν': 'january',
    'φεβρουαρίου': 'february', 'φεβ': 'february',
    'μαρτίου': 'march', 'μαρ': 'march',
    'απριλίου': 'april', 'απρ': 'april',
    'μαΐου': 'may', 'μαι': 'may',
    'ιουνίου': 'june', 'ιουν': 'june',
    'ιουλίου': 'july', 'ιουλ': 'july',
    'αυγούστου': 'august', 'αυγ': 'august',
    'σεπτεμβρίου': 'september', 'σεπ': 'september',
    'οκτωβρίου': 'october', 'οκτ': 'october',
    'νοεμβρίου': 'november', 'νοε': 'november',
    'δεκεμβρίου': 'december', 'δεκ': 'december',
  };

  let normalized = cleaned.toLowerCase().trim();
  
  // Replace Greek months
  for (const [greek, english] of Object.entries(greekMonths)) {
    normalized = normalized.replace(new RegExp(greek, 'gi'), english);
  }

  // Try to parse formats like "14 Dec", "14 December", "Dec 14", etc.
  const patterns = [
    /^(\d{1,2})\s+(\w+)(?:\s+(\d{4}))?$/i, // "14 Dec" or "14 Dec 2024"
    /^(\w+)\s+(\d{1,2})(?:\s*,?\s*(\d{4}))?$/i, // "Dec 14" or "Dec 14, 2024"
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/i, // "14/12/2024" or "14-12-24"
  ];

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) {
      let day: number, month: number, year: number;

      if (pattern === patterns[0]) {
        // "14 Dec" format
        day = parseInt(match[1]);
        const monthName = match[2].toLowerCase();
        month = monthMap[monthName];
        year = match[3] ? parseInt(match[3]) : (contextYear || yearMatch ? parseInt(yearMatch[1]) : currentYear);
      } else if (pattern === patterns[1]) {
        // "Dec 14" format
        const monthName = match[1].toLowerCase();
        month = monthMap[monthName];
        day = parseInt(match[2]);
        year = match[3] ? parseInt(match[3]) : (contextYear || yearMatch ? parseInt(yearMatch[1]) : currentYear);
      } else {
        // "14/12/2024" format
        day = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        year = parseInt(match[3]);
        if (year < 100) year += 2000;
      }

        if (month !== undefined && day && day > 0 && day <= 31) {
        // Determine year - prioritize in this order:
        // 1. Explicit year in date string (match[3])
        // 2. Year extracted from date string (extractedYear)
        // 3. Context year from URL/page (contextYear) - most reliable for events with years in URLs
        // 4. Infer from date position
        if (match[3]) {
          // Year explicitly provided in date
          year = parseInt(match[3]);
        } else if (extractedYear) {
          // Year found in date string (e.g., "Feb 1 2024")
          year = extractedYear;
        } else if (contextYear) {
          // Use context year from URL or page (e.g., URL contains "2024")
          year = contextYear;
        } else {
          // No year - infer from date position
          const thisYearDate = new Date(currentYear, month, day);
          const now = new Date();
          const monthsDiff = (thisYearDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
          
          // If date this year is more than 6 months in the past, assume next year
          if (monthsDiff < -6) {
            year = currentYear + 1;
          } else {
            year = currentYear;
          }
        }
        
        // Validate year is reasonable (2020-2027) and fix if needed
        if (year < 2020 || year > 2027) {
          // Year seems wrong - try to fix using context
          if (contextYear && contextYear >= 2020 && contextYear <= 2027) {
            year = contextYear;
          } else if (extractedYear && extractedYear >= 2020 && extractedYear <= 2027) {
            year = extractedYear;
          } else {
            // Default to current year if all else fails
            year = currentYear;
          }
        }
        
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
  }

  // Try parsing with native Date (fallback)
  const combined = timeStr ? `${normalized} ${timeStr}` : normalized;
  const parsed = new Date(combined);
  
  if (!isNaN(parsed.getTime())) {
    // If year is before 2020, it's likely a parsing error
    if (parsed.getFullYear() < 2020) {
      const now = new Date();
      const parsedMonth = parsed.getMonth();
      const parsedDay = parsed.getDate();
      const currentYear = now.getFullYear();
      
      // Try current year first
      const testDate = new Date(currentYear, parsedMonth, parsedDay);
      const monthsFromNow = (testDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
      
      // If date this year is more than 6 months in the past, try next year
      let year = currentYear;
      if (monthsFromNow < -6) {
        year = currentYear + 1;
      }
      
      return new Date(year, parsedMonth, parsedDay);
    }
    return parsed;
  }

  return null;
}

/**
 * Parse date range string and return both start and end dates
 */
export function parseDateRange(dateStr: string, contextYear?: number): { start: Date; end?: Date } | null {
  if (!dateStr) return null;

  const cleaned = dateStr.trim();
  
  // Handle date ranges (e.g., "14 - 28 Dec - Dec" or "25 - 04 Oct - Nov")
  const rangeMatch = cleaned.match(/^(\d{1,2})\s*[-–]\s*(\d{1,2})\s+(\w+)\s*[-–]\s*(\w+)/i);
  if (rangeMatch) {
    const [, startDay, endDay, startMonth, endMonth] = rangeMatch;
    const startDate = parseDate(`${startDay} ${startMonth}`, undefined, contextYear);
    const endDate = parseDate(`${endDay} ${endMonth}`, undefined, contextYear);
    if (startDate && endDate) {
      return { start: startDate, end: endDate };
    }
    if (startDate) {
      return { start: startDate };
    }
  } else {
    // Handle formats like "14 - 28 Dec" (simpler range)
    const simpleRangeMatch = cleaned.match(/^(\d{1,2})\s*[-–]\s*(\d{1,2})\s+(\w+)/i);
    if (simpleRangeMatch) {
      const [, startDay, endDay, month] = simpleRangeMatch;
      const startDate = parseDate(`${startDay} ${month}`, undefined, contextYear);
      const endDate = parseDate(`${endDay} ${month}`, undefined, contextYear);
      if (startDate && endDate) {
        return { start: startDate, end: endDate };
      }
      if (startDate) {
        return { start: startDate };
      }
    }
  }
  
  // Fallback to single date
  const singleDate = parseDate(dateStr, undefined, contextYear);
  return singleDate ? { start: singleDate } : null;
}

/**
 * Rate limiter per domain
 */
export class RateLimiter {
  private lastRequest: Map<string, number> = new Map();
  private minDelay: number;

  constructor(minDelayMs: number = 1000) {
    this.minDelay = minDelayMs;
  }

  async waitForDomain(url: string): Promise<void> {
    try {
      const domain = new URL(url).hostname;
      const last = this.lastRequest.get(domain) || 0;
      const now = Date.now();
      const elapsed = now - last;

      if (elapsed < this.minDelay) {
        await new Promise(resolve => setTimeout(resolve, this.minDelay - elapsed));
      }

      this.lastRequest.set(domain, Date.now());
    } catch {
      // Invalid URL, proceed anyway
    }
  }
}

/**
 * Fetch with retry and timeout
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  timeout = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'User-Agent': 'ForecastBot/1.0 (contact@forecast.cy)',
          ...options.headers,
        },
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      if (i === retries - 1) throw error;
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }

  clearTimeout(timeoutId);
  throw new Error('Fetch failed after retries');
}
