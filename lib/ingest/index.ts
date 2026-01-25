import { LimassolMunicipalityAdapter } from "./sources/limassol-municipality";
import { SoldOutTicketBoxAdapter } from "./sources/soldout-ticketbox";
import { RialtoInterticketAdapter } from "./sources/rialto-interticket";
import type { EventAdapter, NormalizedEvent } from "./base-adapter";
import { db } from "@/lib/db/client";
import { put } from "@vercel/blob";

const adapters: EventAdapter[] = [
  new LimassolMunicipalityAdapter(),
  new SoldOutTicketBoxAdapter(),
  new RialtoInterticketAdapter(),
];

/**
 * Process events from all sources and upsert to database
 */
export async function ingestEvents() {
  const results = {
    total: 0,
    created: 0,
    updated: 0,
    errors: [] as string[],
  };

  for (const adapter of adapters) {
    try {
      console.log(`Fetching events from ${adapter.name}...`);
      const events = await adapter.fetchEvents();
      results.total += events.length;

      for (const event of events) {
        try {
          await upsertEvent(event);
          results.created++;
        } catch (error: any) {
          console.error(`Error upserting event ${event.sourceExternalId}:`, error);
          results.errors.push(`${adapter.name}: ${error.message}`);
        }
      }

      // Rate limiting: wait between sources
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error: any) {
      console.error(`Error fetching from ${adapter.name}:`, error);
      results.errors.push(`${adapter.name}: ${error.message}`);
    }
  }

  return results;
}

/**
 * Upsert event with idempotent logic
 */
async function upsertEvent(event: NormalizedEvent) {
  // Primary deduplication: source_name + source_external_id
  const existing = await db.query(
    `SELECT id FROM events WHERE source_name = $1 AND source_external_id = $2`,
    [event.sourceName, event.sourceExternalId]
  );

  // Generate slug
  const slug = event.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Handle image upload if needed
  let imageUrl = event.imageUrl;
  if (imageUrl && !imageUrl.startsWith("http")) {
    // If it's a local path, we'd need to download and upload to Vercel Blob
    // For now, skip
  }

  // Upsert venue if provided
  let venueId = null;
  if (event.venue) {
    const venueSlug = event.venue.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const venueResult = await db.query(
      `INSERT INTO venues (name, slug, city, address, lat, lng)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (slug) DO UPDATE SET name = $1, address = $4, lat = $5, lng = $6
       RETURNING id`,
      [
        event.venue.name,
        venueSlug,
        event.city,
        event.venue.address || null,
        event.venue.lat || null,
        event.venue.lng || null,
      ]
    );
    venueId = venueResult.rows[0]?.id;
  }

  if (existing.rows.length > 0) {
    // Update existing event
    await db.query(
      `UPDATE events SET
        title = $1,
        description = $2,
        start_at = $3,
        end_at = $4,
        city = $5,
        venue_id = $6,
        address_text = $7,
        lat = $8,
        lng = $9,
        category = $10,
        tags = $11,
        price_min = $12,
        price_max = $13,
        currency = $14,
        image_url = $15,
        ticket_url = $16,
        source_url = $17,
        updated_at = NOW()
       WHERE id = $18`,
      [
        event.title,
        event.description || null,
        event.startAt,
        event.endAt || null,
        event.city,
        venueId,
        event.address || null,
        event.lat || null,
        event.lng || null,
        event.category || null,
        event.tags || null,
        event.priceMin || null,
        event.priceMax || null,
        event.currency || "EUR",
        imageUrl || null,
        event.ticketUrl || null,
        event.sourceUrl,
        existing.rows[0].id,
      ]
    );
  } else {
    // Create new event
    await db.query(
      `INSERT INTO events (
        title, slug, description, start_at, end_at, city, venue_id,
        address_text, lat, lng, category, tags, price_min, price_max,
        currency, image_url, ticket_url, status, source_name, source_url, source_external_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 'published', $18, $19, $20)
      ON CONFLICT (slug) DO NOTHING`,
      [
        event.title,
        slug,
        event.description || null,
        event.startAt,
        event.endAt || null,
        event.city,
        venueId,
        event.address || null,
        event.lat || null,
        event.lng || null,
        event.category || null,
        event.tags || null,
        event.priceMin || null,
        event.priceMax || null,
        event.currency || "EUR",
        imageUrl || null,
        event.ticketUrl || null,
        event.sourceName,
        event.sourceUrl,
        event.sourceExternalId,
      ]
    );
  }
}
