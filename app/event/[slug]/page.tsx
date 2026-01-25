import { notFound } from "next/navigation";
import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/footer";
import { getEventBySlug } from "@/lib/db/queries/events";
import { EventHero } from "@/components/event/event-hero";
import { ActionButtons } from "@/components/event/action-buttons";
import { VibeCheckForm } from "@/components/event/vibe-check-form";
import { CommentsThread } from "@/components/event/comments-thread";
import { SponsorTile } from "@/components/event/sponsor-tile";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

interface EventPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  let event;
  try {
    event = await getEventBySlug(slug);
  } catch (error) {
    console.error("Error fetching event:", error);
    notFound();
  }

  if (!event) {
    notFound();
  }

  // Increment view count
  // TODO: Implement view tracking

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <EventHero event={event} />
          <ActionButtons eventId={event.id} />
          <VibeCheckForm eventId={event.id} />
          <CommentsThread eventId={event.id} />
          <SponsorTile eventId={event.id} />

          {/* Source Attribution */}
          {event.source_url && (
            <div className="mt-8 border-t border-border-default pt-8">
              <p className="text-sm text-text-tertiary">
                Source:{" "}
                <a
                  href={event.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:underline"
                >
                  {event.source_name || "External"}
                </a>
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
