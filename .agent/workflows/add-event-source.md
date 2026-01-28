---
description: how to add a new event source scraper, normalize its data, and integrate it into the platform
---

1. **Analysis & Selection**
   - Identify a potential event source (URL).
   - Use `browser_subagent` to audit the site:
     - Check listing page structure (selectors for titles, links, images).
     - Check event detail page structure (dates, venues, descriptions).
     - **Important**: Verify if the site has strict anti-bot measures (Cloudflare, etc.).

2. **Scraper Development**
   - Create a new file in `lib/ingest/sources/[source-name].ts`.
   - Implement the `SourceAdapter` interface:
     - `list()`: Returns `RawEventStub[]` from the listing page.
     - `detail()`: Returns `RawEventDetail` from the individual event page.
     - `mapToCanonical()`: Converts raw data to the `CanonicalEvent` format.
   - Use `fetchWithRetry` and `cheerio` (via `load`) for parsing.

3. **Validation & Registration**
   - Register the new adapter class in `lib/ingest/index.ts`.
   - Add it to the `getActiveAdapters()` list.

// turbo
4. **Dry Run Ingestion**

- Verify the scraper works by running it in isolation:
     `npx tsx scripts/ingest-all.ts --source=[source_name]`
- Check the console output for "Found X events" and "Normalization failed" warnings.

1. **UI Verification**
   - Open the application at `http://localhost:3000`.
   - Verify the new source appears in the **Source** dropdown filter.
   - Select the source and verify events are rendered correctly in the `GalleryGrid`.

2. **Final Cleanup**
   - Remove any temporary debug logs.
   - Ensure `isHighRes` and `imageSizeKb` are being handled correctly by the orchestrator.
