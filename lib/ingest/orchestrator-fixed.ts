/**
 * Main ingestion orchestrator
 * Handles running all sources, rate limiting, error handling, and persistence
 */

import type { SourceAdapter, IngestRun } from './types';
import { db } from '@/lib/db/client';
import { RateLimiter, fetchWithRetry } from './utils';
import { normalizeEvent } from './normalize';
import { findDuplicateEvent } from './dedupe';
import { validateEvent } from './validate';
import fs from 'fs';
import path from 'path';


const rateLimiter = new RateLimiter(1500); // 1.5s between requests per domain
const MAX_CONCURRENT = 2; // Max 2 sources running at once

interface IngestResult {
  total: number;
  created: number;
  updated: number;
  errors: string[];
  sourceResults: Record<string, any>;
}

/**
 * Acquire a lock to prevent overlapping runs
 */
async function acquireLock(): Promise<string | null> {
  // Check for running ingest
  const running = await db.query(
    `SELECT id FROM ingest_runs 
     WHERE status = 'running' 
       AND started_at > NOW() - INTERVAL '1 hour'
     ORDER BY started_at DESC
     LIMIT 1`
  );

  if (running.rows.length > 0) {
    console.warn('[Orchestrator] Lock blocked by:', running.rows[0]);
    return null; // Another run is in progress
  }

  // Create new run
  try {
    const result = await db.query(
      `INSERT INTO ingest_runs (status) 
       VALUES ('running')
       RETURNING id`
    );
    console.log('[Orchestrator] Lock acquired:', result.rows[0]?.id);
    return result.rows[0]?.id || null;
  } catch (e: any) {
    console.error('[Orchestrator] Lock insert failed:', e.message);
    throw e;
  }
}

/**
 * Update ingest run status
 */
async function updateRun(
  runId: string,
  updates: Partial<IngestRun>
): Promise<void> {
  const setClause: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (updates.finished_at !== undefined) {
    setClause.push(`finished_at = $${paramCount++}`);
    values.push(updates.finished_at);
  }
  if (updates.status !== undefined) {
    setClause.push(`status = $${paramCount++}`);
    values.push(updates.status);
  }
  if (updates.total_events !== undefined) {
    setClause.push(`total_events = $${paramCount++}`);
    values.push(updates.total_events);
  }
  if (updates.created_count !== undefined) {
    setClause.push(`created_count = $${paramCount++}`);
    values.push(updates.created_count);
  }
  if (updates.updated_count !== undefined) {
    setClause.push(`updated_count = $${paramCount++}`);
    values.push(updates.updated_count);
  }
  if (updates.error_count !== undefined) {
    setClause.push(`error_count = $${paramCount++}`);
    values.push(updates.error_count);
  }
  if (updates.errors !== undefined) {
    setClause.push(`errors = $${paramCount++}`);
    values.push(JSON.stringify(updates.errors));
  }
  if (updates.source_results !== undefined) {
    setClause.push(`source_results = $${paramCount++}`);
    values.push(JSON.stringify(updates.source_results));
  }

  if (setClause.length === 0) return;

  values.push(runId);
  await db.query(
    `UPDATE ingest_runs 
     SET ${setClause.join(', ')}
     WHERE id = $${paramCount}`,
    values
  );
}

/**
 * Process a single source adapter
 */
async function processSource(
  adapter: SourceAdapter,
  runId: string
): Promise<{ total: number; created: number; updated: number; errors: string[] }> {
  const result = {
    total: 0,
    created: 0,
    updated: 0,
    errors: [] as string[],
  };

  try {
    console.log(`[${adapter.name}] Fetching event list...`);

    // Fetch list of events
    const stubs = await adapter.list();
    result.total = stubs.length;

    console.log(`[${adapter.name}] Found ${stubs.length} events`);

    // Process each event
    for (const stub of stubs) {
      try {
        await rateLimiter.waitForDomain(stub.url);

        // Fetch detail if adapter supports it
        let detail;
        if (adapter.detail) {
          try {
            detail = await adapter.detail(stub);
          } catch (error: any) {
            // If it's a 404, skip this event entirely
            if (error.message.includes('404') || error.message.includes('not found')) {
              console.warn(`[${adapter.name}] Skipping ${stub.url}: ${error.message}`);
              continue;
            }
            console.warn(`[${adapter.name}] Failed to fetch detail for ${stub.url}:`, error.message);
            // Continue with stub data only
          }
        }

        // Normalize to canonical format
        let canonical;
        try {
          canonical = normalizeEvent(
            stub,
            detail,
            adapter.name,
            stub.url
          );
        } catch (error: any) {
          const errorMsg = `[${adapter.name}] Normalization failed for ${stub.url}: ${error.message}`;
          console.warn(errorMsg);
          result.errors.push(errorMsg);
          continue; // Skip this event
        }

        // Validate event before processing
        const validation = validateEvent(canonical);
        if (!validation.valid) {
          const errorMsg = `[${adapter.name}] Validation failed for ${stub.url}: ${validation.errors.join(', ')}`;
          console.warn(errorMsg);
          result.errors.push(errorMsg);
          continue; // Skip this event
        }

        // Log warnings but continue
        if (validation.warnings.length > 0) {
          console.warn(`[${adapter.name}] Warnings for ${stub.url}: ${validation.warnings.join(', ')}`);
        }

        // Check for duplicates
        const existingId = await findDuplicateEvent(canonical);

        if (existingId) {
          // Update existing event (preserve source attribution)
          await upsertEvent(canonical, existingId);
          result.updated++;
        } else {
          // Create new event
          const created = await upsertEvent(canonical);
          if (created) {
            result.created++;
          } else {
            result.updated++; // Slug conflict means it already existed
          }
        }
      } catch (error: any) {
        const errorMsg = `[${adapter.name}] Error processing ${stub.url}: ${error.message}`;
        console.error(errorMsg);
        result.errors.push(errorMsg);
        // Continue processing other events even if one fails
      }
    }
  } catch (error: any) {
    const errorMsg = `[${adapter.name}] Fatal error: ${error.message}`;
    console.error(errorMsg);
    result.errors.push(errorMsg);
  }

  return result;
}

/**
 * Helper to get image size in KB via HEAD request
 */
async function getImageSizeKb(url: string): Promise<number | null> {
  if (!url || !url.startsWith('http')) return null;
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const length = response.headers.get('content-length');
    if (length) {
      return Math.round(parseInt(length) / 1024);
    }
  } catch (e) {
    // Silently fail
  }
  return null;
}

/**
 * Downloads an image and saves it locally
 * Returns the public URL path (e.g., /uploads/events/slug.jpg)
 */
async function downloadImage(url: string, slug: string): Promise<string | null> {
  if (!url || !url.startsWith('http')) return null;

  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'events');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Determine extension
    let ext = '.jpg';
    if (url.toLowerCase().endsWith('.png')) ext = '.png';
    else if (url.toLowerCase().endsWith('.webp')) ext = '.webp';
    else if (url.toLowerCase().endsWith('.jpeg')) ext = '.jpg';

    const filename = `${slug}${ext}`;
    const filePath = path.join(uploadDir, filename);
    const publicPath = `/uploads/events/${filename}`;

    // Skip if already exists (optional: check timestamp or force update?)
    // For now, let's re-download if it's missing or maybe we want to refresh it.
    // Let's check if it exists to save bandwidth, but for now we might want to ensure we have it.
    if (fs.existsSync(filePath)) {
      return publicPath;
    }

    const response = await fetch(url);
    if (!response.ok || !response.body) {
      console.warn(`[Download] Failed to fetch image: ${url}`);
      return null;
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));

    return publicPath;
  } catch (error: any) {
    console.warn(`[Download] Failed to download image for ${slug}:`, error.message);
    return null;
  }
}

/**
 * Helper to get local file size in KB
 */
function getLocalFileSizeKb(publicPath: string): number | null {
  if (!publicPath) return null;
  try {
    const rawPath = publicPath.replace(/^\/uploads\/events\//, '');
    const fullPath = path.join(process.cwd(), 'public', 'uploads', 'events', rawPath);
    const stats = fs.statSync(fullPath);
    return Math.round(stats.size / 1024);
  } catch (e) {
    return null;
  }
}

/**
 * Upsert event to database
 * Returns true if created, false if updated
 */
export async function upsertEvent(
  event: ReturnType<typeof normalizeEvent>,
  existingId?: string
): Promise<boolean> {
  const imageSizeKb = await getImageSizeKb(event.imageUrl || '');
  // Generate unique slug by including the date
  const dateStr = event.startAt.toISOString().split('T')[0];
  let slug = `${event.title.toLowerCase()}-${dateStr}`
    .replace(/[^\p{L}\p{N}]+/gu, '-') // Keep unicode letters and numbers
    .replace(/(^-|-$)/g, '');

  // Fallback for empty slugs (e.g. symbols only)
  if (!slug || slug.length < 5) {
    slug = `event-${Buffer.from(event.title).toString('hex').slice(0, 10)}-${dateStr}`;
  }

  // Upsert venue if provided
  let venueId = null;
  if (event.venue) {
    const venueSlug = `${event.venue.name}-${event.city}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const venueResult = await db.query(
      `INSERT INTO venues (name, slug, city, address)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO UPDATE 
         SET name = EXCLUDED.name, 
             address = EXCLUDED.address
       RETURNING id`,
      [event.venue.name, venueSlug, event.city, event.venue.address || null]
    );
    venueId = venueResult.rows[0]?.id;
  }

  // Handle Series ID
  let seriesId = null;
  const seriesMatch = await db.query(
    `SELECT series_id FROM events 
     WHERE title = $1 AND venue_id = $2 AND source_name = $3
     AND series_id IS NOT NULL
     LIMIT 1`,
    [event.title, venueId, event.sourceName]
  );

  if (seriesMatch.rows.length > 0) {
    seriesId = seriesMatch.rows[0].series_id;
  } else {
    // Check if we already have a seriesId in this run for the same group
    // (Actually simpler to let the next event in the same run find the first one)
    // For the absolute first occurrence, generate a new UUID
    const newSeriesId = await db.query('SELECT uuid_generate_v4() as id');
    seriesId = newSeriesId.rows[0].id;
  }

  if (existingId) {
    // Update existing
    const updateResult = await db.query(
      `UPDATE events SET
        title = $1,
        description = $2,
        start_at = $3,
        end_at = $4,
        city = $5,
        venue_id = $6,
        address_text = $7,
        category = $8,
        tags = $9,
        price_min = $10,
        price_max = $11,
        currency = $12,
        image_url = $13,
        ticket_url = $14,
        source_url = $15,
        last_seen_at = NOW(),
        updated_at = NOW(),
        series_id = $17,
        is_high_res = $18,
        image_size_kb = $19
       WHERE id = $16
       RETURNING id`,
      [
        event.title,
        event.description || null,
        event.startAt,
        event.endAt || null,
        event.city,
        venueId,
        event.address || null,
        event.category || null,
        event.tags || null,
        event.priceMin || null,
        event.priceMax || null,
        event.currency || 'EUR',
        event.imageUrl || null,
        event.ticketUrl || null,
        event.sourceUrl,
        existingId,
        seriesId,
        event.isHighRes || false,
        imageSizeKb,
        existingId
      ]
    );
    // Update local image separately if needed, or included in the main update
    // We didn't include it in the main UPDATE statement above. Let's do it now.
    // Actually, let's fix the UPDATE statement to include local_image_url

    const localImageUrl = await downloadImage(event.imageUrl || '', slug);

    // If we have a local image, update the size if the original size was missing
    let finalImageSizeKb = imageSizeKb;
    if (localImageUrl) {
      const localSize = getLocalFileSizeKb(localImageUrl);
      if (localSize) finalImageSizeKb = localSize;
    }

    await db.query(`
      UPDATE events SET 
        local_image_url = $1,
        image_size_kb = COALESCE($2, image_size_kb)
      WHERE id = $3
    `, [localImageUrl, finalImageSizeKb, existingId]);

    return updateResult.rows.length > 0 ? false : false; // Always updated
  } else {
    // Check if event with this slug already exists
    const existingSlug = await db.query(
      `SELECT id FROM events WHERE slug = $1`,
      [slug]
    );

    if (existingSlug.rows.length > 0) {
      // Update existing by slug
      const localImageUrl = await downloadImage(event.imageUrl || '', slug);

      // Calculate final size
      let finalImageSizeKb = imageSizeKb;
      if (localImageUrl) {
        const localSize = getLocalFileSizeKb(localImageUrl);
        if (localSize) finalImageSizeKb = localSize;
      }

      const query = `UPDATE events SET
          title = $1,
          description = $2,
          start_at = $3,
          end_at = $4,
          city = $5,
          venue_id = $6,
          address_text = $7,
          category = $8,
          tags = $9,
          price_min = $10,
          price_max = $11,
          currency = $12,
          image_url = $13,
          ticket_url = $14,
          source_url = $15,
          last_seen_at = NOW(),
          updated_at = NOW(),
          series_id = $17,
          is_high_res = $18,
          image_size_kb = $19,
          local_image_url = $20
         WHERE slug = $16`;

      const params = [
        event.title,
        event.description || null,
        event.startAt,
        event.endAt || null,
        event.city,
        venueId,
        event.address || null,
        event.category || null,
        event.tags || null,
        event.priceMin || null,
        event.priceMax || null,
        event.currency || 'EUR',
        event.imageUrl || null,
        event.ticketUrl || null,
        event.sourceUrl,
        slug,
        seriesId,
        event.isHighRes || false,
        finalImageSizeKb,
        localImageUrl
      ];

      console.log('DEBUG QUERY:', query);
      console.log('DEBUG PARAMS LEN:', params.length);

      await db.query(query, params);
      return false; // Updated
    } else {
      // Insert new
      const localImageUrl = await downloadImage(event.imageUrl || '', slug);

      // Calculate final size
      let finalImageSizeKb = imageSizeKb;
      if (localImageUrl) {
        const localSize = getLocalFileSizeKb(localImageUrl);
        if (localSize) finalImageSizeKb = localSize;
      }

      await db.query(
        `INSERT INTO events (
          title, slug, description, start_at, end_at, city, venue_id,
          address_text, category, tags, price_min, price_max,
          currency, image_url, ticket_url, status,
          source_name, source_url, source_external_id, last_seen_at, series_id, is_high_res, image_size_kb, local_image_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'published', $16, $17, $18, NOW(), $19, $20, $21, $22)`,
        [
          event.title,
          slug,
          event.description || null,
          event.startAt,
          event.endAt || null,
          event.city,
          venueId,
          event.address || null,
          event.category || null,
          event.tags || null,
          event.priceMin || null,
          event.priceMax || null,
          event.currency || 'EUR',
          event.imageUrl || null,
          event.ticketUrl || null,
          event.sourceName,
          event.sourceUrl,
          event.sourceExternalId,
          seriesId,
          event.isHighRes || false,
          finalImageSizeKb,
          localImageUrl
        ]
      );
      return true; // Created
    }
  }
}

/**
 * Archive old events that haven't been seen recently
 */
async function archiveOldEvents(): Promise<number> {
  // Archive events that:
  // - Haven't been seen in last 3 runs (36 hours)
  // - Are in the past
  const result = await db.query(
    `UPDATE events
     SET status = 'archived'
     WHERE status = 'published'
       AND(last_seen_at IS NULL OR last_seen_at < NOW() - INTERVAL '36 hours')
       AND start_at < NOW() - INTERVAL '1 day'
     RETURNING id`
  );

  return result.rows.length;
}

/**
 * Update primary occurrences for all series
 */
async function updatePrimaryOccurrences(): Promise<void> {
  console.log('[Orchestrator] Updating primary occurrences...');

  // 1. Reset all primary flags
  await db.query('UPDATE events SET is_primary_occurrence = FALSE');

  // 2. Find the earliest upcoming event for each active series
  // We use DISTINCT ON (series_id) to get the first row per group based on ORDER BY
  await db.query(`
    WITH EarliestOccurrences AS(
          SELECT DISTINCT ON(series_id) id
      FROM events
      WHERE status = 'published' 
        AND start_at >= NOW() - INTERVAL '6 hours'
        AND series_id IS NOT NULL
      ORDER BY series_id, start_at ASC
        )
    UPDATE events
    SET is_primary_occurrence = TRUE
    WHERE id IN(SELECT id FROM EarliestOccurrences)
        `);
}

/**
 * Main ingestion function
 */
export async function runIngestion(adapters: SourceAdapter[]): Promise<IngestResult> {
  const runId = await acquireLock();
  if (!runId) {
    throw new Error('Another ingestion run is in progress');
  }

  const result: IngestResult = {
    total: 0,
    created: 0,
    updated: 0,
    errors: [],
    sourceResults: {},
  };

  try {
    console.log(`[Ingest] Starting run ${runId} with ${adapters.length} sources`);

    // Process sources with limited concurrency
    const sourcePromises: Promise<void>[] = [];
    let activeCount = 0;

    for (const adapter of adapters) {
      // Wait if we're at max concurrency
      while (activeCount >= MAX_CONCURRENT) {
        await Promise.race(sourcePromises);
        activeCount--;
      }

      activeCount++;
      const promise = processSource(adapter, runId).then((sourceResult) => {
        result.total += sourceResult.total;
        result.created += sourceResult.created;
        result.updated += sourceResult.updated;
        result.errors.push(...sourceResult.errors);
        result.sourceResults[adapter.name] = sourceResult;
        activeCount--;
      });

      sourcePromises.push(promise);
    }

    // Wait for all sources to complete
    await Promise.all(sourcePromises);

    // Archive old events
    const archivedCount = await archiveOldEvents();
    console.log(`[Ingest] Archived ${archivedCount} old events`);

    // Update primary occurrences
    await updatePrimaryOccurrences();

    // Update run status
    await updateRun(runId, {
      finished_at: new Date(),
      status: 'completed',
      total_events: result.total,
      created_count: result.created,
      updated_count: result.updated,
      error_count: result.errors.length,
      errors: result.errors,
      source_results: result.sourceResults,
    });

    console.log(`[Ingest] Completed: ${result.created} created, ${result.updated} updated, ${result.errors.length} errors`);
  } catch (error: any) {
    console.error(`[Ingest] Fatal error: `, error);
    await updateRun(runId, {
      finished_at: new Date(),
      status: 'failed',
      errors: [error.message],
    });
    throw error;
  }

  return result;
}
