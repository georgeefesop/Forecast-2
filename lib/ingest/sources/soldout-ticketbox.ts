import type { EventAdapter, NormalizedEvent } from "../base-adapter";

/**
 * SoldOut TicketBox calendar adapter
 * Note: This is a placeholder implementation.
 * Real implementation would scrape or use their API if available.
 */
export class SoldOutTicketBoxAdapter implements EventAdapter {
  name = "soldout_ticketbox";

  async fetchEvents(): Promise<NormalizedEvent[]> {
    // TODO: Implement actual scraping/API integration
    // For now, return empty array
    // Example structure:
    // 1. Fetch events page
    // 2. Parse HTML/JSON
    // 3. Extract event data (title, date, venue, price, ticket link)
    // 4. Normalize dates
    // 5. Return normalized events

    return [];
  }
}
