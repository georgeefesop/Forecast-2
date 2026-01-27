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
  user_interested?: boolean;
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
  interestedByUserId?: string;
  viewerId?: string;
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
    language
  } = options;

  let query = `
    SELECT 
      e.*,
      v.name as venue_name,
      v.slug as venue_slug,
      v.city as venue_city,
      ec.interested_count,
      ec.going_count,
      ec.saves_count,
      CASE WHEN $1::text IS NOT NULL THEN
        EXISTS(
          SELECT 1 FROM event_actions ea 
          WHERE ea.event_id = e.id AND ea.user_id = $1 AND ea.type = 'interested'
        )
      ELSE false END as user_interested
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
  }

  if (city) {
    query += ` AND (LOWER(e.city) = LOWER($${paramIndex}) OR (v.city IS NOT NULL AND LOWER(v.city) = LOWER($${paramIndex})))`;
    params.push(city);
    paramIndex++;
  }

  if (category) {
    query += ` AND (LOWER(e.category) = LOWER($${paramIndex}) OR $${paramIndex} = ANY(SELECT LOWER(unnest(e.tags))))`;
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

  if (date) {
    if (date === "today") {
      query += ` AND DATE(e.start_at) = CURRENT_DATE`;
    } else if (date === "weekend") {
      query += ` AND EXTRACT(DOW FROM e.start_at) IN (5, 6, 0) AND e.start_at >= CURRENT_DATE`;
    } else if (date === "week") {
      query += ` AND e.start_at >= CURRENT_DATE AND e.start_at <= CURRENT_DATE + INTERVAL '7 days'`;
    } else if (date === "month") {
      query += ` AND e.start_at >= CURRENT_DATE AND e.start_at <= CURRENT_DATE + INTERVAL '30 days'`;
    } else if (date === "past") {
      query += ` AND e.start_at < NOW()`;
    }
  } else {
    query += ` AND e.start_at >= NOW()`;
  }

  if (primaryOnly) {
    query += ` AND e.is_primary_occurrence = TRUE`;
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
      AND ea.type = 'interested'
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
    user_interested: !!row.user_interested,
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

export async function getEventBySlug(slug: string): Promise<Event | null> {
  // Trim and normalize the slug
  const normalizedSlug = slug.trim();

  const result = await db.query(
    `
    SELECT 
      e.*,
      v.name as venue_name,
      v.slug as venue_slug,
      v.city as venue_city,
      ec.interested_count,
      ec.going_count,
      ec.saves_count
    FROM events e
    LEFT JOIN venues v ON e.venue_id = v.id
    LEFT JOIN event_counters ec ON e.id = ec.event_id
    WHERE e.slug = $1 AND e.status = 'published'
    `,
    [normalizedSlug]
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
      ec.interested_count,
      ec.going_count,
      ec.saves_count
    FROM events e
    LEFT JOIN venues v ON e.venue_id = v.id
    LEFT JOIN event_counters ec ON e.id = ec.event_id
    WHERE e.status = 'published' 
      AND e.start_at >= NOW()
      AND ec.last_activity_at >= NOW() - INTERVAL '7 days'
    ORDER BY (ec.interested_count + ec.going_count) DESC, ec.last_activity_at DESC, e.id ASC
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
  }));
}
