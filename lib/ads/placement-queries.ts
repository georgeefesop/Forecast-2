import { db } from "@/lib/db/client";

export interface Placement {
  id: string;
  campaign_id: string;
  placement_type: string;
  config_json: any;
  campaign?: {
    product_type: string;
    status: string;
    starts_at: Date | null;
    ends_at: Date | null;
    targeting_json: any;
    creative_json: any;
  };
}

export async function getActivePlacements(
  placementType: string,
  filters?: {
    city?: string;
    category?: string;
  }
): Promise<Placement[]> {
  const now = new Date().toISOString();

  let query = `
    SELECT p.*, c.product_type, c.status, c.starts_at, c.ends_at, c.targeting_json, c.creative_json
    FROM placements p
    JOIN campaigns c ON p.campaign_id = c.id
    WHERE p.placement_type = $1
      AND c.status = 'active'
      AND (c.starts_at IS NULL OR c.starts_at <= $2)
      AND (c.ends_at IS NULL OR c.ends_at >= $2)
  `;

  const params: any[] = [placementType, now];
  let paramIndex = 3;

  // Apply targeting filters
  if (filters?.city) {
    query += ` AND (c.targeting_json->>'city' IS NULL OR c.targeting_json->>'city' = $${paramIndex})`;
    params.push(filters.city);
    paramIndex++;
  }

  if (filters?.category) {
    query += ` AND (c.targeting_json->>'category' IS NULL OR c.targeting_json->>'category' = $${paramIndex})`;
    params.push(filters.category);
    paramIndex++;
  }

  query += ` ORDER BY c.budget_cents DESC LIMIT 10`;

  const result = await db.query(query, params);
  return result.rows.map((row) => ({
    id: row.id,
    campaign_id: row.campaign_id,
    placement_type: row.placement_type,
    config_json: row.config_json,
    campaign: {
      product_type: row.product_type,
      status: row.status,
      starts_at: row.starts_at,
      ends_at: row.ends_at,
      targeting_json: row.targeting_json,
      creative_json: row.creative_json,
    },
  }));
}
