# Event Ingestion System

The Forecast ingestion system automatically pulls events from multiple public sources, normalizes them, and stores them in the database.

## Architecture

The ingestion system is modular and consists of:

- **Orchestrator** (`lib/ingest/orchestrator.ts`): Manages running all sources, rate limiting, error handling, and persistence
- **Source Adapters** (`lib/ingest/sources/`): Individual adapters for each event source
- **Normalization** (`lib/ingest/normalize.ts`): Converts raw event data to canonical format
- **Deduplication** (`lib/ingest/dedupe.ts`): Identifies duplicate events across sources
- **Utilities** (`lib/ingest/utils.ts`): Helper functions for date parsing, rate limiting, etc.

## Source Adapters

### Implemented Sources

1. **All About Limassol** (`all-about-limassol.ts`)
   - URL: https://allaboutlimassol.com/en/agenda/
   - Status: ✅ Implemented

2. **Limassol Marina** (`limassol-marina.ts`)
   - URL: https://www.limassolmarina.com/whats-on
   - Status: ✅ Implemented

3. **Limassol Tourism Board** (`limassol-tourism.ts`)
   - URL: https://www.limassoltourism.com/en/blog/events-calendar/
   - Status: ✅ Implemented

### Pending Sources

4. Limassol Municipality
5. SoldOut TicketBox
6. Rialto Interticket
7. Interticket Cyprus
8. Eventor
9. Eventbrite

## Running Ingestion

### Automatic (Production)

Ingestion runs automatically every 12 hours via Vercel Cron:

- Schedule: `0 */12 * * *` (every 12 hours)
- Endpoint: `/api/ingest/run-all`
- Protected by: `INGEST_SECRET` environment variable

### Manual (Development)

**Via API (with secret):**
```bash
curl -X POST http://localhost:3000/api/ingest/run-all \
  -H "x-ingest-secret: your-secret-here"
```

**Via API (dev mode, no secret):**
```bash
curl http://localhost:3000/api/ingest/run-all
```

**Via Code:**
```typescript
import { runIngestion, getActiveAdapters } from '@/lib/ingest';

const adapters = getActiveAdapters();
const results = await runIngestion(adapters);
console.log(results);
```

## Environment Variables

Required:
- `DATABASE_URL`: PostgreSQL connection string
- `INGEST_SECRET`: Secret for protecting the ingestion endpoint (production)

Optional:
- `NODE_ENV`: Set to `production` to require secret for GET requests

## Database Schema

### ingest_runs Table

Tracks each ingestion run:
- `id`: UUID
- `started_at`: Timestamp
- `finished_at`: Timestamp (nullable)
- `status`: 'running' | 'completed' | 'failed'
- `total_events`: Number of events processed
- `created_count`: Number of new events
- `updated_count`: Number of updated events
- `error_count`: Number of errors
- `errors`: JSON array of error messages
- `source_results`: JSON object with per-source results

### Events Table

Events table includes:
- `last_seen_at`: Timestamp of last successful ingestion
- `source_name`: Name of the source adapter
- `source_url`: Original URL of the event
- `source_external_id`: Stable ID derived from source URL

## Features

### Rate Limiting

- 1.5 seconds between requests per domain
- Prevents overwhelming source servers
- Respectful user-agent: "ForecastBot/1.0 (contact@forecast.cy)"

### Error Handling

- Individual source failures don't stop the entire run
- Errors are logged and tracked in `ingest_runs.errors`
- Failed events are skipped, others continue processing

### Deduplication

1. **Exact match**: Same `source_name` + `source_external_id`
2. **Fuzzy match**: Cross-source matching based on:
   - Same city
   - Start time within 2 hours
   - Similar title (normalized, punctuation removed)
   - Similar venue name (if available)

### Archiving

Events are automatically archived if:
- Haven't been seen in last 36 hours (3 runs)
- Start date is in the past
- Status is 'published'

Archived events are not deleted, just marked as 'archived'.

### Idempotency

- Safe to run multiple times
- Uses upsert logic (INSERT ... ON CONFLICT)
- Updates existing events if found
- Creates new events if not found

## Adding a New Source

1. Create a new adapter file in `lib/ingest/sources/`:

```typescript
import type { SourceAdapter, RawEventStub, RawEventDetail } from '../types';
import { fetchWithRetry } from '../utils';
import cheerio from 'cheerio';

export class MySourceAdapter implements SourceAdapter {
  name = 'my_source';
  private baseUrl = 'https://example.com/events';

  async list(): Promise<RawEventStub[]> {
    // Fetch and parse list page
    // Return array of event stubs
  }

  async detail(stub: RawEventStub): Promise<RawEventDetail> {
    // Fetch and parse detail page
    // Return detailed event data
  }

  mapToCanonical(raw: RawEventStub & Partial<RawEventDetail>): any {
    // This is handled by normalize.ts
    return raw as any;
  }
}
```

2. Export it in `lib/ingest/index.ts`
3. Add it to `getActiveAdapters()` function

## Troubleshooting

### Migration Required

Before first run, execute the migration:

```bash
node scripts/migrate-ingestion-tracking.js
```

### No Events Found

- Check source URLs are still valid
- Verify HTML structure hasn't changed
- Check browser console for CORS/network errors
- Review `ingest_runs.errors` in database

### Rate Limiting Issues

- Increase delay in `RateLimiter` constructor
- Check source website's robots.txt
- Consider caching list pages

### Date Parsing Issues

- Check `parseDate()` function handles your date format
- Add Greek month name mappings if needed
- Verify timezone handling (Europe/Nicosia)

## Monitoring

Check ingestion status:

```sql
SELECT * FROM ingest_runs 
ORDER BY started_at DESC 
LIMIT 10;
```

Check recent events:

```sql
SELECT title, source_name, last_seen_at, start_at 
FROM events 
WHERE status = 'published'
ORDER BY last_seen_at DESC 
LIMIT 20;
```

## Future Improvements

- [ ] Add caching for list pages (content hash)
- [ ] Implement Playwright for JS-heavy sources
- [ ] Add geocoding for addresses
- [ ] Implement cross-source source URL merging
- [ ] Add webhook notifications for ingestion completion
- [ ] Add admin dashboard for monitoring
