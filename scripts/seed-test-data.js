#!/usr/bin/env node

/**
 * Script to seed test data into the database
 * Creates users, venues, events, comments, and event actions
 * Run with: node scripts/seed-test-data.js
 */

const { sql } = require("@vercel/postgres");
const dotenv = require("dotenv");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

// Helper function to generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Helper function to get future date
function getFutureDate(daysFromNow, hours = 19) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hours, 0, 0, 0);
  return date.toISOString();
}

// Test data
const testUsers = [
  {
    user_id: "test_user_1",
    handle: "alex_cyprus",
    email: "alex@example.com",
  },
  {
    user_id: "test_user_2",
    handle: "maria_events",
    email: "maria@example.com",
  },
  {
    user_id: "test_user_3",
    handle: "dimitri_nightlife",
    email: "dimitri@example.com",
  },
  {
    user_id: "test_user_4",
    handle: "sophia_culture",
    email: "sophia@example.com",
  },
  {
    user_id: "test_user_5",
    handle: "organizer_pro",
    email: "organizer@example.com",
    is_organizer: true,
  },
];

const cities = ["Limassol", "Nicosia", "Larnaca", "Paphos", "Ayia Napa"];
const categories = [
  "Nightlife",
  "Culture",
  "Family",
  "Outdoors",
  "Food & Drink",
  "Music",
  "Sports",
  "Arts",
];

const venues = [
  {
    name: "The Club Limassol",
    city: "Limassol",
    address: "Makarios Avenue 123",
    lat: 34.6754,
    lng: 33.0444,
    type: "Nightclub",
    tags: ["nightlife", "dancing", "music"],
  },
  {
    name: "Cultural Center Nicosia",
    city: "Nicosia",
    address: "Ledra Street 45",
    lat: 35.1856,
    lng: 33.3823,
    type: "Cultural Center",
    tags: ["culture", "arts", "exhibitions"],
  },
  {
    name: "Beach Bar Larnaca",
    city: "Larnaca",
    address: "Finikoudes Beach",
    lat: 34.9167,
    lng: 33.6333,
    type: "Beach Bar",
    tags: ["beach", "outdoors", "food"],
  },
  {
    name: "Art Gallery Paphos",
    city: "Paphos",
    address: "Kato Paphos",
    lat: 34.7589,
    lng: 32.4156,
    type: "Gallery",
    tags: ["arts", "culture", "exhibitions"],
  },
  {
    name: "Stadium Nicosia",
    city: "Nicosia",
    address: "Stadium Road 1",
    lat: 35.15,
    lng: 33.35,
    type: "Stadium",
    tags: ["sports", "outdoors"],
  },
];

const events = [
  {
    title: "Jazz Night at The Club",
    description:
      "Join us for an unforgettable evening of live jazz music featuring local and international artists. Enjoy cocktails and great vibes.",
    city: "Limassol",
    category: "Music",
    tags: ["jazz", "live music", "nightlife"],
    price_min: 15,
    price_max: 25,
    currency: "EUR",
    image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
    ticket_url: "https://example.com/tickets/jazz-night",
    daysFromNow: 3,
    hours: 20,
  },
  {
    title: "Contemporary Art Exhibition Opening",
    description:
      "Opening night of our latest contemporary art exhibition featuring works from emerging Cypriot artists. Wine and refreshments provided.",
    city: "Nicosia",
    category: "Arts",
    tags: ["art", "exhibition", "culture"],
    price_min: 0,
    price_max: 0,
    currency: "EUR",
    image_url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop",
    ticket_url: null,
    daysFromNow: 5,
    hours: 18,
  },
  {
    title: "Beach Party Sunset",
    description:
      "The ultimate beach party experience with DJ sets, cocktails, and stunning sunset views. Free entry before 8 PM.",
    city: "Larnaca",
    category: "Nightlife",
    tags: ["beach", "party", "dancing"],
    price_min: 0,
    price_max: 10,
    currency: "EUR",
    image_url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
    ticket_url: "https://example.com/tickets/beach-party",
    daysFromNow: 7,
    hours: 19,
  },
  {
    title: "Food Festival 2025",
    description:
      "Taste the best of Cyprus! Food trucks, local vendors, live cooking demonstrations, and family-friendly activities.",
    city: "Limassol",
    category: "Food & Drink",
    tags: ["food", "festival", "family"],
    price_min: 5,
    price_max: 20,
    currency: "EUR",
    image_url: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop",
    ticket_url: "https://example.com/tickets/food-festival",
    daysFromNow: 10,
    hours: 12,
  },
  {
    title: "Yoga in the Park",
    description:
      "Start your weekend with a relaxing yoga session in the beautiful park. All levels welcome. Bring your own mat.",
    city: "Paphos",
    category: "Outdoors",
    tags: ["yoga", "wellness", "outdoors"],
    price_min: 0,
    price_max: 0,
    currency: "EUR",
    image_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop",
    ticket_url: null,
    daysFromNow: 6,
    hours: 9,
  },
  {
    title: "Electronic Music Night",
    description:
      "Dance the night away with top DJs spinning the latest electronic beats. State-of-the-art sound system and lighting.",
    city: "Ayia Napa",
    category: "Nightlife",
    tags: ["electronic", "dancing", "nightlife"],
    price_min: 20,
    price_max: 30,
    currency: "EUR",
    image_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
    ticket_url: "https://example.com/tickets/electronic-night",
    daysFromNow: 4,
    hours: 22,
  },
  {
    title: "Children's Theater Show",
    description:
      "Fun and interactive theater show for kids aged 5-12. Puppets, music, and lots of audience participation!",
    city: "Nicosia",
    category: "Family",
    tags: ["theater", "kids", "family"],
    price_min: 8,
    price_max: 12,
    currency: "EUR",
    image_url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&h=600&fit=crop",
    ticket_url: "https://example.com/tickets/theater-kids",
    daysFromNow: 8,
    hours: 15,
  },
  {
    title: "Football Match: Local Derby",
    description:
      "Watch the biggest local derby of the season. Get your tickets early - this one always sells out!",
    city: "Nicosia",
    category: "Sports",
    tags: ["football", "sports", "match"],
    price_min: 15,
    price_max: 35,
    currency: "EUR",
    image_url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop",
    ticket_url: "https://example.com/tickets/football",
    daysFromNow: 12,
    hours: 17,
  },
  {
    title: "Wine Tasting Evening",
    description:
      "Sample award-winning local wines paired with Cypriot cheeses. Expert sommelier will guide you through the tasting.",
    city: "Limassol",
    category: "Food & Drink",
    tags: ["wine", "tasting", "food"],
    price_min: 25,
    price_max: 35,
    currency: "EUR",
    image_url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=600&fit=crop",
    ticket_url: "https://example.com/tickets/wine-tasting",
    daysFromNow: 9,
    hours: 19,
  },
  {
    title: "Photography Workshop",
    description:
      "Learn landscape photography techniques from a professional photographer. Bring your camera and explore the beautiful coastline.",
    city: "Paphos",
    category: "Arts",
    tags: ["photography", "workshop", "outdoors"],
    price_min: 30,
    price_max: 40,
    currency: "EUR",
    image_url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=600&fit=crop",
    ticket_url: "https://example.com/tickets/photography",
    daysFromNow: 11,
    hours: 10,
  },
];

const comments = [
  "Can't wait for this! The lineup looks amazing.",
  "Is there parking available nearby?",
  "I went last year and it was incredible! Highly recommend.",
  "What time does it start?",
  "Free entry? That's awesome!",
  "Bringing the whole family to this one.",
  "The venue is beautiful, perfect for this event.",
  "Do we need to book in advance?",
  "This sounds like exactly what I've been looking for!",
  "See you all there! 🎉",
];

async function seedData() {
  try {
    console.log("🌱 Starting test data seeding...\n");

    if (!process.env.DATABASE_URL) {
      console.error("❌ DATABASE_URL is not set in environment variables");
      process.exit(1);
    }

    // 1. Create test users
    console.log("👥 Creating test users...");
    const userIds = [];
    for (const user of testUsers) {
      try {
        await sql.query(
          `INSERT INTO profiles (user_id, handle, email, is_organizer)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (user_id) DO UPDATE SET handle = EXCLUDED.handle, email = EXCLUDED.email`,
          [user.user_id, user.handle, user.email, user.is_organizer || false]
        );
        userIds.push(user.user_id);
        console.log(`   ✓ Created user: ${user.handle}`);
      } catch (error) {
        console.log(`   ⚠ User ${user.handle} already exists or error: ${error.message}`);
        userIds.push(user.user_id);
      }
    }

    // 2. Create venues
    console.log("\n🏢 Creating venues...");
    const venueIds = [];
    for (const venue of venues) {
      const slug = generateSlug(venue.name);
      try {
        const result = await sql.query(
          `INSERT INTO venues (name, slug, city, address, lat, lng, type, tags)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [
            venue.name,
            slug,
            venue.city,
            venue.address,
            venue.lat,
            venue.lng,
            venue.type,
            venue.tags,
          ]
        );
        const venueId = result.rows[0]?.id || result.rows[0]?.id;
        venueIds.push(venueId);
        console.log(`   ✓ Created venue: ${venue.name}`);
      } catch (error) {
        // If venue exists, get its ID
        const existing = await sql.query("SELECT id FROM venues WHERE slug = $1", [slug]);
        if (existing.rows.length > 0) {
          venueIds.push(existing.rows[0].id);
          console.log(`   ⚠ Venue ${venue.name} already exists`);
        } else {
          console.log(`   ✗ Error creating venue ${venue.name}: ${error.message}`);
        }
      }
    }

    // 3. Create events
    console.log("\n🎉 Creating events...");
    const eventIds = [];
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const slug = generateSlug(event.title);
      const startAt = getFutureDate(event.daysFromNow, event.hours);
      const endAt = new Date(startAt);
      endAt.setHours(endAt.getHours() + 3);
      
      // Match event to venue by city
      const matchingVenueIndex = venues.findIndex((v) => v.city === event.city);
      const venueId = matchingVenueIndex >= 0 ? venueIds[matchingVenueIndex] : null;

      try {
        const result = await sql.query(
          `INSERT INTO events (
            title, slug, description, start_at, end_at, city, venue_id,
            category, tags, price_min, price_max, currency, image_url, ticket_url,
            status, created_by_user_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
          RETURNING id`,
          [
            event.title,
            slug,
            event.description,
            startAt,
            endAt.toISOString(),
            event.city,
            venueId,
            event.category,
            event.tags,
            event.price_min,
            event.price_max,
            event.currency,
            event.image_url,
            event.ticket_url,
            "published",
            userIds[i % userIds.length], // Distribute events among users
          ]
        );
        const eventId = result.rows[0]?.id;
        eventIds.push(eventId);
        console.log(`   ✓ Created event: ${event.title}`);
      } catch (error) {
        // If event exists, get its ID
        const existing = await sql.query("SELECT id FROM events WHERE slug = $1", [slug]);
        if (existing.rows.length > 0) {
          eventIds.push(existing.rows[0].id);
          console.log(`   ⚠ Event ${event.title} already exists`);
        } else {
          console.log(`   ✗ Error creating event ${event.title}: ${error.message}`);
        }
      }
    }

    // 4. Create event counters
    console.log("\n📊 Creating event counters...");
    for (const eventId of eventIds) {
      try {
        await sql.query(
          `INSERT INTO event_counters (event_id, interested_count, going_count, saves_count)
           VALUES ($1, 0, 0, 0)
           ON CONFLICT (event_id) DO NOTHING`,
          [eventId]
        );
      } catch (error) {
        // Counter might already exist, that's fine
      }
    }

    // 5. Create event actions (interested, going, saves)
    console.log("\n❤️ Creating event actions...");
    for (let i = 0; i < eventIds.length; i++) {
      const eventId = eventIds[i];
      const numUsers = Math.floor(Math.random() * 3) + 1; // 1-3 users per event
      
      for (let j = 0; j < numUsers; j++) {
        const userId = userIds[j % userIds.length];
        const actionTypes = ["interested", "going", "save"];
        const actionType = actionTypes[Math.floor(Math.random() * actionTypes.length)];
        
        try {
          await sql.query(
            `INSERT INTO event_actions (user_id, event_id, type)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, event_id, type) DO NOTHING`,
            [userId, eventId, actionType]
          );
        } catch (error) {
          // Action might already exist, that's fine
        }
      }
    }
    console.log("   ✓ Created event actions (triggers will update counters)");

    // 6. Create comments
    console.log("\n💬 Creating comments...");
    for (let i = 0; i < eventIds.length; i++) {
      const eventId = eventIds[i];
      const numComments = Math.floor(Math.random() * 3) + 1; // 1-3 comments per event
      
      for (let j = 0; j < numComments; j++) {
        const userId = userIds[j % userIds.length];
        const commentText = comments[Math.floor(Math.random() * comments.length)];
        
        try {
          await sql.query(
            `INSERT INTO comments (event_id, user_id, body, status)
             VALUES ($1, $2, $3, 'visible')`,
            [eventId, userId, commentText]
          );
        } catch (error) {
          console.log(`   ⚠ Error creating comment: ${error.message}`);
        }
      }
    }
    console.log("   ✓ Created comments");

    // Summary
    console.log("\n✅ Test data seeding completed!");
    console.log(`\n📈 Summary:`);
    console.log(`   - Users: ${userIds.length}`);
    console.log(`   - Venues: ${venueIds.length}`);
    console.log(`   - Events: ${eventIds.length}`);
    console.log(`   - Comments: Created on events`);
    console.log(`   - Event Actions: Created (counters updated automatically)`);

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding test data:", error);
    process.exit(1);
  }
}

seedData();
