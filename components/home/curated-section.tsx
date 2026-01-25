import { EventCard } from "@/components/event-card";

interface CuratedSectionProps {
  title: string;
  filter: "tonight" | "weekend" | "popular" | "free";
}

// Mock data - will be replaced with real database queries
const mockEvents = [
  {
    id: "1",
    slug: "event-1",
    title: "Jazz Night at The Club",
    startAt: new Date(Date.now() + 3600000),
    venue: { name: "The Club", city: "Limassol" },
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
    interestedCount: 45,
    goingCount: 23,
    category: "Music",
  },
  {
    id: "2",
    slug: "event-2",
    title: "Art Exhibition Opening",
    startAt: new Date(Date.now() + 7200000),
    venue: { name: "Gallery One", city: "Limassol" },
    imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400",
    interestedCount: 32,
    goingCount: 18,
    category: "Arts",
  },
  {
    id: "3",
    slug: "event-3",
    title: "Food Festival 2025",
    startAt: new Date(Date.now() + 10800000),
    venue: { name: "Marina", city: "Limassol" },
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
    interestedCount: 128,
    goingCount: 67,
    category: "Food & Drink",
  },
];

export function CuratedSection({ title, filter }: CuratedSectionProps) {
  // TODO: Replace with real data fetching based on filter
  const events = mockEvents;

  if (events.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-6 text-fluid-2xl font-bold text-text-primary">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} {...event} />
        ))}
      </div>
    </section>
  );
}
