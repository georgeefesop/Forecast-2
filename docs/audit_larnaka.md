# Audit Report: Larnaca Municipality (`larnaka.org.cy`)

## Target URLs

- **Listing**: [Events Calendar](https://www.larnaka.org.cy/en/information/cultural-activities-initiatives/events-calendar/)
- **Detail (Sample)**: [«Άκουε πολλά τζιαι πίστευκε λία… »](https://www.larnaka.org.cy/en/events/akoue-polla-tziai-pistefke-lia/?occurrence=2026-01-28)

## 1. Requirement Checklist & Findings

| Field | Required | Found (Listing) | Found (Detail) | Notes |
| :--- | :---: | :---: | :---: | :--- |
| **Title** | Yes | Yes | Yes | |
| **URL** | Yes | Yes | - | |
| **Image** | Yes | Yes | Yes | |
| **Date** | Yes | No | Yes | Date is in URL param `occurrence` and text. |
| **Time** | No | No | Yes | |
| **Venue** | Yes | No | Yes | Venue found in Google Calendar link location. |
| **Description**| Yes | No | Yes | |
| **Category** | No | No | Yes | |
| **Price** | No | No | Yes | |

## 2. Scraping Policy (robots.txt)

- **Status**: Allowed.
- **Rules**: Disallows `/wp-admin/`. Events are under `/en/events/` which is permitted.

## 3. Selector Identification (Manual Audit)

### Listing Page

- **Container**: `article.tribe_events_cat-celebration` (Standard "The Events Calendar" structure likely)
- **Title/Link**: `h4.tribe-events-calendar-list__event-title a`
- **Image**: `.tribe-events-calendar-list__event-featured-image img`

### Detail Page

- **Title**: `h1.entry-title`
- **Date/Time**: `.tribe-events-schedule h2` / `span.tribe-events-start-date`
- **Venue**: `dd.tribe-venue` or extracted from `a[href*="google.com/calendar"]` location param.
- **Description**: `.tribe-events-single-event-description`
- **Image**: `.tribe-events-event-image img`
- **Category**: `.tribe-events-event-categories`
- **Price**: `.tribe-events-cost`

## 4. Technical Feasibility

- **Anti-Bot**: Low. Standard WordPress site.
- **Dynamic Content**: Initial listing is static, but might have pagination.
- **Structured Data**: Likely contains JSON-LD (LD+JSON) from "The Events Calendar" plugin.
