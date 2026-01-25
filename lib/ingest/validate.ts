/**
 * Validation for ingested events
 * Ensures required fields are present and data quality is good
 */

import type { CanonicalEvent } from './types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate a canonical event before insertion
 * Required fields (priority order):
 * 1. Title - MUST have
 * 2. Start date - MUST have (for filtering)
 * 3. Source URL - MUST have (for deduplication)
 * 4. City - MUST have (defaults to Limassol)
 */
export function validateEvent(event: CanonicalEvent): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!event.title || event.title.trim().length < 3) {
    errors.push('Title is required and must be at least 3 characters');
  }

  if (!event.startAt || !(event.startAt instanceof Date) || isNaN(event.startAt.getTime())) {
    errors.push('Start date is required and must be a valid date');
  }

  if (!event.sourceUrl || !event.sourceUrl.startsWith('http')) {
    errors.push('Source URL is required and must be a valid URL');
  }

  if (!event.city || event.city.trim().length === 0) {
    errors.push('City is required');
  }

  // Validate date is not too far in the past
  if (event.startAt) {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    if (event.startAt < oneDayAgo) {
      errors.push(`Event date is in the past: ${event.startAt.toISOString()}`);
    }
    
    // Warn if date is more than 2 years in the future
    const twoYearsFromNow = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());
    if (event.startAt > twoYearsFromNow) {
      warnings.push(`Event date is more than 2 years in the future: ${event.startAt.toISOString()}`);
    }
  }

  // Validate title quality
  if (event.title) {
    // Reject generic titles
    const genericTitles = ['agenda', 'events', 'event', 'whats on', "what's on"];
    if (genericTitles.includes(event.title.toLowerCase().trim())) {
      warnings.push('Title is generic and may not be descriptive');
    }
    
    // Reject date-range titles
    if (event.title.match(/^\d{1,2}\s*[-–]\s*\d{1,2}(\s+\w+)?$/)) {
      errors.push('Title appears to be a date range, not an event name');
    }
  }

  // Warnings for missing optional but important fields
  if (!event.description || event.description.trim().length < 10) {
    warnings.push('Description is missing or too short');
  }

  if (!event.venue || !event.venue.name) {
    warnings.push('Venue information is missing');
  }

  if (!event.imageUrl) {
    warnings.push('Image URL is missing');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
