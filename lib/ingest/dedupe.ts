/**
 * Deduplication logic for events across sources
 */

import type { CanonicalEvent } from './types';
import { db } from '@/lib/db/client';
import { areEventsSimilar } from './utils';

/**
 * Find existing event that might be the same as the new one
 */
export async function findDuplicateEvent(
  newEvent: CanonicalEvent
): Promise<string | null> {
  // First, check by source + external_id (exact match)
  const exactMatch = await db.query(
    `SELECT id FROM events 
     WHERE source_name = $1 AND source_external_id = $2`,
    [newEvent.sourceName, newEvent.sourceExternalId]
  );

  if (exactMatch.rows.length > 0) {
    return exactMatch.rows[0].id;
  }

  // Cross-source fuzzy matching
  // Find events in same city, within expanded date range (for multi-day events)
  // Use a 7-day window to catch multi-day events that might overlap
  const candidateWindow = new Date(newEvent.startAt);
  candidateWindow.setDate(candidateWindow.getDate() - 1); // Start 1 day before
  candidateWindow.setHours(0, 0, 0, 0);
  
  const candidateWindowEnd = new Date(newEvent.startAt);
  // If event has an end date, extend window to end date + 1 day
  if (newEvent.endAt) {
    candidateWindowEnd.setTime(newEvent.endAt.getTime());
  }
  candidateWindowEnd.setDate(candidateWindowEnd.getDate() + 1); // End 1 day after
  candidateWindowEnd.setHours(23, 59, 59, 999);

  const candidates = await db.query(
    `SELECT id, title, start_at, city, 
            (SELECT name FROM venues WHERE id = events.venue_id) as venue_name
     FROM events
     WHERE city = $1 
       AND start_at >= $2 
       AND start_at <= $3
       AND status = 'published'
     LIMIT 50`,
    [newEvent.city, candidateWindow, candidateWindowEnd]
  );

  // Check each candidate for similarity
  for (const candidate of candidates.rows) {
    const candidateEvent = {
      title: candidate.title,
      startAt: new Date(candidate.start_at),
      city: candidate.city,
      venue: candidate.venue_name ? { name: candidate.venue_name } : undefined,
    };

    // For multi-day events, relax the time window check
    const timeDiff = Math.abs(newEvent.startAt.getTime() - candidateEvent.startAt.getTime());
    const maxTimeDiff = newEvent.endAt 
      ? Math.max(7 * 24 * 60 * 60 * 1000, newEvent.endAt.getTime() - newEvent.startAt.getTime()) // Multi-day events get longer window
      : 2 * 60 * 60 * 1000; // Single events: 2 hours
    
    if (timeDiff <= maxTimeDiff && areEventsSimilar(newEvent, candidateEvent)) {
      return candidate.id;
    }
  }

  return null;
}
