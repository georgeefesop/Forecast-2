# Pending Ingestion Sources

Prioritized list of event sources to be added to Forecast.

## Priority 1: Ticket Vendors

1. **TicketBox.com.cy** (In Progress)
    - Description: Major local ticket vendor for concerts, theater, and festivals.
    - URL: `https://ticketbox.com.cy`
2. **MyTicketCy.com**
    - Description: Popular for concerts and large events.
    - URL: `https://myticketcy.com`
3. **More.com** (Viva.gr)
    - Description: Regional giant expanding in Cyprus.
    - URL: `https://www.more.com/en/tickets/cyprus/`

## Priority 2: Aggregators & Calendars

4. **Cyproplan.com**
    - Description: Comprehensive general calendar.
    - URL: `https://www.cyproplan.com`
2. **Eventbrite**
    - Description: International platform, good for workshops and professional networking.
    - URL: `https://www.eventbrite.com/d/cyprus--limassol/events/`

## Priority 3: Official & Venue Specific

6. **VisitCyprus.com**
    - Description: Official Deputy Ministry of Tourism.
    - URL: `https://www.visitcyprus.com/`
2. **Pattihio Municipal Theatre**
    - Description: Major Limassol venue.
    - URL: `https://www.pattihio.com.cy/`
3. **DowntownNicosia.live**
    - Description: Key nightlife/music venue in Nicosia.
    - URL: `https://downtownnicosia.live/`
4. **ThisIsPafos.com**
    - Description: Regional focus for expansion.
    - URL: `https://www.thisispafos.com/`

## Implementation Notes

- For each source, creating a dedicated adapter in `lib/ingest/sources/`.
- Ensure correct Timezone handling (Asia/Nicosia).
- Use `IngestOrchestrator` to manage rate limits.
