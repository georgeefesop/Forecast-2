# Forecast - What's On in Limassol

A production MVP for discovering events, venues, and what's happening in Limassol, Cyprus.

## Features

- **Event Discovery**: Search, filter, and explore events by date, category, and location
- **Map View**: Interactive map showing events and venues
- **Social Features**: Interested/Going toggles, comments, vibe checks
- **Venue Pages**: First-class venue pages with upcoming events
- **User Submissions**: Submit events for moderation
- **Organizer Dashboard**: Claim venues, manage events, promote content
- **Monetization**: Built-in advertising infrastructure (payments deferred)
- **Admin Panel**: Moderation tools for submissions, claims, and reports

## Tech Stack

- **Framework**: Next.js 14+ (App Router) + TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **Database**: Vercel Postgres (Note: @vercel/postgres is deprecated, consider migrating to Neon)
- **Auth**: NextAuth.js (email magic links)
- **Storage**: Vercel Blob (images)
- **Maps**: MapLibre GL
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Vercel account (for Postgres and Blob)
- Environment variables (see `.env.example`)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Fill in your environment variables
   ```

4. Set up the database:
   - Create a Vercel Postgres database
   - Run the schema from `lib/db/schema.sql`

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

See `.env.example` for required environment variables:

- `DATABASE_URL` - Vercel Postgres connection string
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob token
- `NEXTAUTH_SECRET` - Secret for NextAuth.js
- `NEXTAUTH_URL` - Your app URL
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` - Email configuration
- `CRON_SECRET` - Secret for cron job authentication

## Project Structure

```
/app
  /api          - API routes
  /auth         - Authentication pages
  /account      - User account page
  /admin        - Admin dashboard
  /boost        - Promotion wizard
  /event        - Event detail pages
  /explore      - Event exploration
  /map          - Map view
  /organizer    - Organizer dashboard
  /submit       - Event submission
  /venues       - Venue pages
/components    - React components
/lib
  /db           - Database client and queries
  /ingest       - Event ingestion pipeline
  /ads          - Advertising/placement system
/public        - Static assets
```

## Key Features

### Design System

- Comprehensive token system using CSS variables
- Light/dark theme support with persistence
- Mobile-first responsive design
- Fluid typography for headings
- Accessible focus states and keyboard navigation

### Event Ingestion

- Modular adapter system for multiple sources
- Idempotent upsert logic
- Daily cron job for automatic updates
- Support for Limassol Municipality, SoldOut TicketBox, Rialto/Interticket

### Monetization

- Multiple placement types (home banner, featured, explore inserts, etc.)
- Campaign management system
- Boost wizard for creating promotions
- Stripe integration scaffolded (deferred)

## Deployment

1. Deploy to Vercel:
   ```bash
   vercel
   ```

2. Set up environment variables in Vercel dashboard

3. Configure cron job in `vercel.json`

4. Run database migrations

## Notes

- **@vercel/postgres is deprecated**: Consider migrating to Neon Postgres
- **Stripe integration**: Scaffolded but not implemented (see Phase 11)
- **Email delivery**: Configured but requires SMTP setup
- **Phone OTP**: Placeholder for future implementation

## License

ISC
