# Deferred Features

This document tracks features that are not implemented yet but have architecture ready for future implementation.

## Payment Integration

- **Stripe Checkout**: Checkout session creation is scaffolded but not implemented
- **Stripe Webhook**: Webhook handler route exists but needs implementation
- **Payment Status Updates**: Campaign status updates on payment success are deferred

## Email & Newsletter

- **Email Delivery**: NextAuth email provider configured but SMTP not set up
- **Newsletter Sending**: Newsletter digest job and email template system deferred
- **Resend Integration**: Email delivery service integration deferred

## Advanced Features

- **Recommendation Engine**: User preference-based event recommendations
- **Full Ticketing Integration**: Vendor commissions and ticket sales
- **Advanced Anti-Spam**: Reputation system and automated moderation
- **Phone OTP Auth**: Twilio or similar provider integration for phone authentication

## Ingestion Sources

The following sources have adapter placeholders but need full implementation:

- Limassol Municipality Events Calendar
- SoldOut TicketBox calendar
- Rialto / Interticket program pages
- Limassol Marina "What's On"
- AllAboutLimassol Agenda

## Map Features

- **Event/venue markers**: Map pins for events and venues need to be populated from database
- **Clustering**: Marker clustering at different zoom levels
- **Promoted pins**: Highlighting promoted events on map

## Admin Features

- **Bulk Actions**: Bulk approve/reject for submissions
- **User Notifications**: Email notifications on approval/rejection
- **Analytics Dashboard**: Event views, engagement metrics
