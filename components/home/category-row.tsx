import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { ArrowRight } from "lucide-react";

interface CategoryRowProps {
  category: string;
}

// Mock data - will be replaced with real database queries
const mockEvents = [
  {
    id: "1",
    slug: "event-1",
    title: "Sample Event",
    startAt: new Date(Date.now() + 86400000),
    venue: { name: "Venue", city: "Limassol" },
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
    interestedCount: 12,
    goingCount: 5,
    category: "Nightlife",
  },
];

export function CategoryRow({ category }: CategoryRowProps) {
  // TODO: Replace with real data fetching by category
  const events = mockEvents;

  if (events.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-fluid-2xl font-bold text-text-primary">
          {category}
        </h2>
        <Link
          href={`/explore?category=${encodeURIComponent(category)}`}
          className="flex items-center gap-1 text-sm font-medium text-brand hover:underline"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {events.slice(0, 4).map((event) => (
          <EventCard key={event.id} {...event} />
        ))}
      </div>
    </section>
  );
}
