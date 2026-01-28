# Developer Guide: Adding Event Sources

This guide explains how to add a new website as an event source for the platform.

## Architecture Overview

The ingestion system is built on a "Registry" pattern:

1. **Adapters**: Specialized classes that know how to talk to a specific website.
2. **Registry**: `lib/ingest/index.ts` lists all active adapters.
3. **Orchestrator**: `lib/ingest/orchestrator.ts` runs the adapters, dedupes events, and saves them to the DB.

## Step-by-Step Instructions

### 1. The Adapter File

Create `lib/ingest/sources/your-source.ts`. Implement `SourceAdapter`.

```typescript
import { SourceAdapter, RawEventStub, RawEventDetail, CanonicalEvent } from '../types';
import { fetchWithRetry, deriveExternalId } from '../utils';
import { load } from 'cheerio';

export class YourSourceAdapter implements SourceAdapter {
    name = 'your_source_name'; // Use snake_case

    async list(): Promise<RawEventStub[]> {
        // 1. Fetch listing HTML
        // 2. Parse titles and URLs using Cheerio
        // 3. Return RawEventStub[]
    }

    async detail(stub: RawEventStub): Promise<RawEventDetail> {
        // 1. Fetch detail HTML
        // 2. Extract description, startAt, venue name, etc.
        // 3. Return RawEventDetail
    }

    mapToCanonical(raw: RawEventStub & Partial<RawEventDetail>): CanonicalEvent {
        return {
            title: raw.title,
            startAt: raw.startAt || new Date(),
            city: raw.city || 'Limassol',
            venue: raw.venue,
            sourceName: this.name,
            sourceUrl: raw.url,
            sourceExternalId: deriveExternalId(raw.url),
            // ... other fields
        };
    }
}
```

### 2. Normalization Tools

Use the utilities in `lib/ingest/utils.ts`:

- `parseDate(str)`: Handles various date formats, including Greek month names.
- `detectCity(text)`: Scans text for Cyprus city names.
- `detectPrice(text)`: Extracts EUR amounts from snippets.
- `deriveExternalId(url)`: Generates a stable ID for deduplication.

### 3. Registry Registration

Open `lib/ingest/index.ts`:

1. Import your class.
2. Add `new YourSourceAdapter()` to the `getActiveAdapters()` array.

### 4. Testing

Run the ingestion script for *only* your source to avoid waiting:

```bash
npx tsx scripts/ingest-all.ts --source=your_source_name
```

## Best Practices

- **Stable Slugs**: The system handles slug generation, but ensure your `title` and `startAt` are accurate as they form the primary event identity.
- **Anti-Bot**: If a site blocks you, check if there is a JSON-LD script tag or a hidden API. Avoid scraping if the site has heavy protection unless requested.
- **Images**: The orchestrator automatically downloads and processes images. You just need to provide the `imageUrl`.
