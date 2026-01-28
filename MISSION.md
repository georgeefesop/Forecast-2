# mission.md — Forecast

## Mission

Build the fastest, most trustworthy way to decide **what to do in Cyprus tonight** — and **what the vibe will be** — in under 30 seconds.

## Product promise

Forecast helps people quickly answer:

- What’s on (tonight / weekend / this week)?
- Where is it?
- Is it worth going?
- How many people are interested/going?
- How do I get tickets / directions?

## Target users

1) **People in Cyprus** looking for plans (locals + expats).
2) **Organizers/venues** who want events discovered and promoted.
3) **Curators/admins** ensuring quality and accuracy.

## Core principles (non-negotiable)

- **Browse-first**: anyone can browse; login only for actions (save, going/interested, comment, submit, claim, promote).
- **Useful > pretty**: every page must help a user decide or act.
- **Premium, editorial UI**: feels like a $10k product—clean, calm, confident.
- **Mobile-first, responsive everywhere**: excellent on phones; also beautiful on large screens.
- **Light + dark mode**: both themes supported from day one.
- **Truth and attribution**: events show sources; errors can be reported.
- **No creepy social graph**: no follower-driven social network. Community is optional and pseudonymous.

## MVP scope (what we are building now)

### Core pages

- Home: nav + search + filters + big sponsored banner + curated sections
- Explore: search results + filters + promoted inserts
- Map: separate page (upcoming + live)
- Event detail: interested/going toggles + counts + ticket/directions
- Venues list: searchable, filterable, shows activity (upcoming count)
- Venue detail: map, contact, upcoming events, claim CTA
- Submit event: auth-gated, moderation
- Organizer: claim venue, edit venue, create/edit events
- Admin: moderate submissions/claims/reports
- Promote/Boost: campaign creation and placement system (payments later)

### Minimum features

- Real database + real ingestion from public event sources
- Interested/Going toggles (counts visible everywhere relevant)
- Venue layer (useful, not empty)
- Basic moderation tools
- Ad placements rendered in UI (sponsored/featured/promoted)

## Data integrity requirements

- Events are deduped as best as possible.
- Venues are deduped and normalized (no messy duplicates).
- All imported events keep `source_name` + `source_url`.

## Monetization (built-in, payments can be deferred)

- Home sponsored banner
- Featured placements
- Promoted inserts in Explore
- Map promoted highlights
- Event page sponsor tile
- Newsletter sponsor slot (template-ready)

## Quality bar

“Premium” means:

- consistent spacing + typography system
- tokenized design (CSS variables / Tailwind tokens)
- beautiful states (hover/active/focus/disabled)
- fast, readable, and scan-friendly
- strong empty states and no broken-looking pages

## Definition of done (for each increment)

A feature is done only when:

- it works end-to-end in the UI,
- it has clean empty/loading/error states,
- it matches the design system,
- and it does not introduce new scope without permission.

## Out of scope (for now)

- Full ticketing/commission checkout
- Full newsletter sending automation
- Sophisticated recommendation engine
- User-to-user messaging / follower social network
- Real-time location crowd tracking
