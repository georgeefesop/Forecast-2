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
  ticket_url: string | null;
  status: string;
  source_name: string | null;
  source_url: string | null;
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
}

export async function getEvents(filters: {
  city?: string;
  category?: string;
  date?: string;
  free?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<Event[]> {
  let query = `
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
  `;
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.city) {
    query += ` AND e.city = $${paramIndex}`;
    params.push(filters.city);
    paramIndex++;
  }

  if (filters.category) {
    query += ` AND e.category = $${paramIndex}`;
    params.push(filters.category);
    paramIndex++;
  }

  if (filters.free) {
    query += ` AND (e.price_min IS NULL OR e.price_min = 0)`;
  }

  if (filters.search) {
    query += ` AND (e.title ILIKE $${paramIndex} OR e.description ILIKE $${paramIndex})`;
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  if (filters.date) {
    const now = new Date();
    if (filters.date === "today") {
      query += ` AND DATE(e.start_at) = CURRENT_DATE`;
    } else if (filters.date === "weekend") {
      query += ` AND EXTRACT(DOW FROM e.start_at) IN (5, 6, 0) AND e.start_at >= CURRENT_DATE`;
    } else if (filters.date === "week") {
      query += ` AND e.start_at >= CURRENT_DATE AND e.start_at <= CURRENT_DATE + INTERVAL '7 days'`;
    } else if (filters.date === "month") {
      query += ` AND e.start_at >= CURRENT_DATE AND e.start_at <= CURRENT_DATE + INTERVAL '30 days'`;
    }
  } else {
    query += ` AND e.start_at >= NOW()`;
  }

  query += ` ORDER BY e.start_at ASC`;

  if (filters.limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(filters.limit);
    paramIndex++;
  }

  if (filters.offset) {
    query += ` OFFSET $${paramIndex}`;
    params.push(filters.offset);
  }

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
  }));
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
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
    [slug]
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
    ORDER BY (ec.interested_count + ec.going_count) DESC, ec.last_activity_at DESC
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
