import { db } from "@/lib/db/client";

export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  start_at: Date;
  end_at: Date | null;
  city: string;
  venue_id: string | null;
  address_text: string | null;
  lat: number | null;
  lng: number | null;
  category: string | null;
  tags: string[] | null;
  price_min: number | null;
  price_max: number | null;
  currency: string;
  image_url: string | null;
  local_image_url?: string | null;
  ticket_url: string | null;
  status: string;
  source_name: string | null;
  source_url: string | null;
  series_id: string | null;
  is_primary_occurrence: boolean;
  image_size_kb?: number | null;
  is_high_res?: boolean;
  venue?: {
    name: string;
    slug: string;
    city: string;
  };
  counters?: {
    interested_count: number;
    going_count: number;
    saves_count: number;
  };
  saved_count?: number;
  user_saved?: boolean;
}

export interface GetEventsOptions {
  city?: string;
  category?: string;
  date?: string;
  free?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
  primaryOnly?: boolean;
  ids?: string[];
  seriesId?: string;
  excludeSeriesId?: string;
  hasCoordinates?: boolean;
  language?: string;
  excludeLanguages?: string[];
  interestedByUserId?: string;
  viewerId?: string;
  sources?: string[];
  venue?: string;
  hideLowQuality?: boolean;
}

export async function getEvents(options: GetEventsOptions = {}): Promise<Event[]> {
  const {
    limit = 50,
    offset = 0,
    date,
    category,
    city,
    free,
    search,
    primaryOnly,
    ids,
    seriesId,
    excludeSeriesId,
    hasCoordinates,
    language,
    excludeLanguages,
    sources,
    hideLowQuality
  } = options;

  let query = `
    SELECT 
      e.*,
      v.name as venue_name,
      v.slug as venue_slug,
      v.city as venue_city,
      (COALESCE(ec.interested_count, 0) + COALESCE(ec.going_count, 0) + COALESCE(ec.saves_count, 0)) as saved_count,
      CASE WHEN $1::text IS NOT NULL THEN
        EXISTS(
          SELECT 1 FROM event_actions ea 
          WHERE ea.event_id = e.id AND ea.user_id = $1 AND ea.type IN ('save', 'interested', 'going')
        )
      ELSE false END as user_saved
    FROM events e
    LEFT JOIN venues v ON e.venue_id = v.id
    LEFT JOIN event_counters ec ON e.id = ec.event_id
    WHERE e.status = 'published'
  `;
  const viewerId = options.viewerId || null;
  const params: any[] = [viewerId];
  let paramIndex = 2;

  if (language) {
    query += ` AND e.language = $${paramIndex}`;
    params.push(language);
    paramIndex++;
  } else if (options.excludeLanguages && options.excludeLanguages.length > 0) {
    // Exclusion Logic: Show events where language is NOT in the excluded list OR is NULL
    query += ` AND (e.language IS NULL OR NOT (e.language = ANY($${paramIndex}::text[])))`;
    params.push(options.excludeLanguages);
    paramIndex++;
  }

  if (city) {
    query += ` AND (LOWER(e.city) = LOWER($${paramIndex}) OR (v.city IS NOT NULL AND LOWER(v.city) = LOWER($${paramIndex})))`;
    params.push(city);
    paramIndex++;
  }

  if (category) {
    query += ` AND (LOWER(e.category) = LOWER($${paramIndex}) OR LOWER($${paramIndex}) = ANY(SELECT LOWER(unnest(e.tags))))`;
    params.push(category);
    paramIndex++;
  }

  if (free) {
    query += ` AND (e.price_min IS NULL OR e.price_min = 0)`;
  }

  if (search) {
    query += ` AND (e.title ILIKE $${paramIndex} OR e.description ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (options.venue) {
    query += ` AND v.slug = $${paramIndex}`;
    params.push(options.venue);
    paramIndex++;
  }

  if (date) {
    if (date === "today") {
      query += ` AND DATE(e.start_at) = CURRENT_DATE`;
    } else if (date === "weekend") {
      // Upcoming weekend: From now until next Monday.
      // If today is Sunday, this covers rest of today.
      query += ` 
        AND e.start_at >= CURRENT_DATE 
        AND e.start_at < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
        AND EXTRACT(DOW FROM e.start_at) IN (5, 6, 0)
      `;
    } else if (date === "week") {
      // This week: From now until next Monday (end of current week).
      query += ` 
        AND e.start_at >= CURRENT_DATE 
        AND e.start_at < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
      `;
    } else if (date === "month") {
      // This month: From now until start of next month.
      query += ` 
        AND e.start_at >= CURRENT_DATE 
        AND e.start_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
      `;
    } else if (date === "past") {
      query += ` AND e.start_at < NOW()`;
    }
  } else {
    query += ` AND e.start_at >= NOW()`;
  }

  if (sources && sources.length > 0) {
    query += ` AND e.source_name = ANY($${paramIndex}::text[])`;
    params.push(sources);
    paramIndex++;
  }

  if (primaryOnly) {
    query += ` AND e.is_primary_occurrence = TRUE`;
  }

  if (hideLowQuality) {
    query += ` AND (e.image_size_kb IS NULL OR e.image_size_kb >= 20)`;
  }

  if (ids && ids.length > 0) {
    query += ` AND e.id = ANY($${paramIndex}::uuid[])`;
    params.push(ids);
    paramIndex++;
  }

  if (seriesId) {
    query += ` AND e.series_id = $${paramIndex}`;
    params.push(seriesId);
    paramIndex++;
  }

  if (excludeSeriesId) {
    query += ` AND (e.series_id IS NULL OR e.series_id != $${paramIndex})`;
    params.push(excludeSeriesId);
    paramIndex++;
  }

  if (hasCoordinates) {
    // Logic for coordinates check if implemented (e.g. venue lat/lng)
    // For now omitting to match previous logic complexity unless needed
  }

  if (options.interestedByUserId) {
    query += ` AND EXISTS (
      SELECT 1 FROM event_actions ea 
      WHERE ea.event_id = e.id 
      AND ea.user_id = $${paramIndex} 
      AND ea.type IN ('save', 'interested', 'going')
    )`;
    params.push(options.interestedByUserId);
    paramIndex++;
  }

  const sortDir = date === "past" ? "DESC" : "ASC";

  if (primaryOnly) {
    query += ` ORDER BY e.is_high_res DESC, (e.local_image_url IS NOT NULL) DESC, e.start_at ${sortDir}, e.id ASC`;
  } else {
    query += ` ORDER BY e.is_high_res DESC, e.start_at ${sortDir}, e.id ASC`;
  }

  query += ` LIMIT $${paramIndex}`;
  params.push(limit);
  paramIndex++;

  query += ` OFFSET $${paramIndex}`;
  params.push(offset);
  paramIndex++; // Good practice even if last

  const result = await db.query(query, params);
  return result.rows.map((row) => ({
    ...row,
    venue: row.venue_name
      ? {
        name: row.venue_name,
        slug: row.venue_slug,
        city: row.venue_city,
      }
      : undefined,
    counters: {
      interested_count: row.interested_count || 0,
      going_count: row.going_count || 0,
      saves_count: row.saves_count || 0,
    },
    saved_count: parseInt(row.saved_count) || 0,
    user_saved: !!row.user_saved,
  }));
}

/**
 * Get all occurrences of a series
 */
export async function getSeriesOccurrences(seriesId: string): Promise<Event[]> {
  const result = await db.query(
    `
    SELECT 
      e.id, e.title, e.slug, e.start_at, e.end_at, 
      v.name as venue_name, v.city as venue_city
    FROM events e
    LEFT JOIN venues v ON e.venue_id = v.id
    WHERE e.series_id = $1 AND e.status = 'published'
    ORDER BY e.start_at ASC
    `,
    [seriesId]
  );
  return result.rows;
}

export async function getEventBySlug(slug: string, viewerId?: string): Promise<Event | null> {
  // Trim and normalize the slug
  const normalizedSlug = slug.trim();

  const result = await db.query(
    `
    SELECT 
      e.*,
      v.name as venue_name,
      v.slug as venue_slug,
      v.city as venue_city,
      (COALESCE(ec.interested_count, 0) + COALESCE(ec.going_count, 0) + COALESCE(ec.saves_count, 0)) as saved_count,
      CASE WHEN $2::text IS NOT NULL THEN
        EXISTS(
          SELECT 1 FROM event_actions ea 
          WHERE ea.event_id = e.id AND ea.user_id = $2 AND ea.type IN ('save', 'interested', 'going')
        )
      ELSE false END as user_saved
    FROM events e
    LEFT JOIN venues v ON e.venue_id = v.id
    LEFT JOIN event_counters ec ON e.id = ec.event_id
    WHERE e.slug = $1 AND e.status = 'published'
    `,
    [normalizedSlug, viewerId || null]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    ...row,
    venue: row.venue_name
      ? {
        name: row.venue_name,
        slug: row.venue_slug,
        city: row.venue_city,
      }
      : undefined,
    counters: {
      interested_count: row.interested_count || 0,
      going_count: row.going_count || 0,
      saves_count: row.saves_count || 0,
    },
    saved_count: parseInt(row.saved_count) || 0,
    user_saved: !!row.user_saved,
  };
}

export async function getPopularEvents(limit: number = 10): Promise<Event[]> {
  const result = await db.query(
    `
    SELECT 
      e.*,
      v.name as venue_name,
      v.slug as venue_slug,
      v.city as venue_city,
      (COALESCE(ec.interested_count, 0) + COALESCE(ec.going_count, 0) + COALESCE(ec.saves_count, 0)) as saved_count
    FROM events e
    LEFT JOIN venues v ON e.venue_id = v.id
    LEFT JOIN event_counters ec ON e.id = ec.event_id
    WHERE e.status = 'published' 
      AND e.start_at >= NOW()
    ORDER BY (COALESCE(ec.interested_count, 0) + COALESCE(ec.going_count, 0) + COALESCE(ec.saves_count, 0)) DESC, ec.last_activity_at DESC, e.id ASC
    LIMIT $1
    `,
    [limit]
  );

  return result.rows.map((row) => ({
    ...row,
    venue: row.venue_name
      ? {
        name: row.venue_name,
        slug: row.venue_slug,
        city: row.venue_city,
      }
      : undefined,
    counters: {
      interested_count: row.interested_count || 0,
      going_count: row.going_count || 0,
      saves_count: row.saves_count || 0,
    },
    saved_count: parseInt(row.saved_count) || 0,
  }));
}
