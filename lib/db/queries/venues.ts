import { db } from "@/lib/db/client";

export interface Venue {
  id: string;
  name: string;
  slug: string;
  city: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  type: string | null;
  tags: string[] | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  claim_status: string;
  claimed_by_user_id: string | null;
}

export async function getVenues(filters: {
  city?: string;
  type?: string;
  search?: string;
  limit?: number;
}): Promise<Venue[]> {
  let query = `SELECT * FROM venues WHERE 1=1`;
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.city) {
    query += ` AND city = $${paramIndex}`;
    params.push(filters.city);
    paramIndex++;
  }

  if (filters.type) {
    query += ` AND type = $${paramIndex}`;
    params.push(filters.type);
    paramIndex++;
  }

  if (filters.search) {
    query += ` AND (name ILIKE $${paramIndex} OR address ILIKE $${paramIndex})`;
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  query += ` ORDER BY name ASC`;

  if (filters.limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(filters.limit);
  }

  const result = await db.query(query, params);
  return result.rows;
}

export async function getVenueBySlug(slug: string): Promise<Venue | null> {
  const result = await db.query("SELECT * FROM venues WHERE slug = $1", [slug]);
  return result.rows[0] || null;
}
