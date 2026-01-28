import { db } from "@/lib/db/client";

export interface Venue {
  id: string;
  name: string;
  slug: string;
  city: string;
  area: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  type: string | null;
  tags: string[] | null;
  phone: string | null;
  email: string | null;
  website_url: string | null;
  instagram_url: string | null;
  short_description: string | null;
  about: string | null;
  images: string[] | null;
  claim_status: string;
  claimed_by_user_id: string | null;
  // Computed
  upcoming_events_count?: number;
  total_saves?: number;
  next_event_at?: Date | null;
}

export async function getVenues(filters: {
  city?: string;
  type?: string;
  search?: string;
  limit?: number;
  sort?: 'trending' | 'active' | 'az';
}): Promise<Venue[]> {
  const baseQuery = `
    SELECT 
      v.*,
      COALESCE(v.website_url, v.website) as website_url, 
      COALESCE(v.instagram_url, v.instagram) as instagram_url,
      (SELECT COUNT(*) 
       FROM events e 
       WHERE e.venue_id = v.id 
         AND e.start_at >= NOW() 
         AND e.status = 'published'
      ) as upcoming_events_count,
      (SELECT COALESCE(SUM(COALESCE(ec.interested_count, 0) + COALESCE(ec.going_count, 0) + COALESCE(ec.saves_count, 0)), 0)
       FROM events e
       LEFT JOIN event_counters ec ON e.id = ec.event_id
       WHERE e.venue_id = v.id
         AND e.status = 'published'
      ) as total_saves,
      (SELECT MIN(start_at) 
       FROM events e 
       WHERE e.venue_id = v.id 
         AND e.start_at >= NOW()
         AND e.status = 'published'
      ) as next_event_at
    FROM venues v
    WHERE 1=1
  `;

  let whereClause = "";
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.city) {
    whereClause += ` AND v.city = $${paramIndex}`;
    params.push(filters.city);
    paramIndex++;
  }

  if (filters.type) {
    whereClause += ` AND v.type = $${paramIndex}`;
    params.push(filters.type);
    paramIndex++;
  }

  if (filters.search) {
    whereClause += ` AND (v.name ILIKE $${paramIndex} OR v.address ILIKE $${paramIndex})`;
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  // Sort Logic
  let orderBy = "ORDER BY v.name ASC"; // Default (covers 'az')
  if (filters.sort === 'active') {
    orderBy = "ORDER BY upcoming_events_count DESC, v.name ASC";
  } else if (filters.sort === 'trending') {
    // For now, trending = mostly active next 30 days or general activity
    // Using upcoming_events_count as proxy or could join event_counters
    orderBy = "ORDER BY upcoming_events_count DESC, v.name ASC";
  } else if (filters.sort === 'az') {
    orderBy = "ORDER BY v.name ASC";
  }

  let finalQuery = `${baseQuery} ${whereClause} ${orderBy}`;

  if (filters.limit) {
    finalQuery += ` LIMIT $${paramIndex}`;
    params.push(filters.limit);
  }

  const result = await db.query(finalQuery, params);

  return result.rows.map(row => ({
    ...row,
    upcoming_events_count: parseInt(row.upcoming_events_count) || 0,
    total_saves: parseInt(row.total_saves) || 0,
    next_event_at: row.next_event_at ? new Date(row.next_event_at) : null
  }));
}

export async function getVenueById(id: string): Promise<Venue | null> {
  const result = await db.query("SELECT * FROM venues WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function getVenueBySlug(slug: string): Promise<Venue | null> {
  const result = await db.query(`
    SELECT 
      v.*,
      COALESCE(v.website_url, v.website) as website_url, 
      COALESCE(v.instagram_url, v.instagram) as instagram_url,
      (SELECT COUNT(*) FROM events e WHERE e.venue_id = v.id AND e.start_at >= NOW() AND e.status = 'published') as upcoming_events_count,
      (SELECT COALESCE(SUM(COALESCE(ec.interested_count, 0) + COALESCE(ec.going_count, 0) + COALESCE(ec.saves_count, 0)), 0) 
       FROM events e 
       LEFT JOIN event_counters ec ON e.id = ec.event_id 
       WHERE e.venue_id = v.id AND e.status = 'published') as total_saves,
      (SELECT MIN(start_at) FROM events e WHERE e.venue_id = v.id AND e.start_at >= NOW() AND e.status = 'published') as next_event_at
    FROM venues v
    WHERE v.slug = $1
  `, [slug]);

  if (result.rows.length === 0) return null;
  const row = result.rows[0];

  return {
    ...row,
    upcoming_events_count: parseInt(row.upcoming_events_count) || 0,
    total_saves: parseInt(row.total_saves) || 0,
    next_event_at: row.next_event_at ? new Date(row.next_event_at) : null
  };
}

export async function getVenueFacets() {
  const cityQuery = `
    SELECT city, COUNT(*) as count
    FROM venues
    GROUP BY city
    ORDER BY count DESC
  `;
  const typeQuery = `
    SELECT type, COUNT(*) as count
    FROM venues
    WHERE type IS NOT NULL
    GROUP BY type
    ORDER BY count DESC
  `;

  const [cities, types] = await Promise.all([
    db.query(cityQuery),
    db.query(typeQuery)
  ]);

  return {
    cities: cities.rows.map(r => ({ value: r.city, count: parseInt(r.count) })),
    types: types.rows.map(r => ({ value: r.type, count: parseInt(r.count) }))
  };
}
