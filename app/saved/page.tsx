import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/footer";
import { EventList } from "@/components/explore/event-list";
import { getEvents } from "@/lib/db/queries/events";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/auth/signin?callbackUrl=/saved");
    }

    const events = await getEvents({
        interestedByUserId: session.user.id,
        viewerId: session.user.id,
        limit: 100, // Reasonable limit
    });

    return (
        <div className="flex min-h-screen flex-col">
            <MainNav />
            <main className="flex-1">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-8 flex items-center gap-3">
                        <div className="p-3 bg-red-50 rounded-full">
                            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
                        </div>
                        <div>
                            <h1 className="text-fluid-3xl font-bold text-text-primary">
                                Saved Events
                            </h1>
                            <p className="text-text-secondary mt-1">
                                Events you are interested in attending.
                            </p>
                        </div>
                    </div>

                    {events.length > 0 ? (
                        <EventList events={events} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center bg-background-elevated rounded-xl border border-border-default">
                            <div className="p-4 bg-background-surface rounded-full mb-4">
                                <Heart className="h-10 w-10 text-text-tertiary" />
                            </div>
                            <h3 className="text-xl font-semibold text-text-primary mb-2">No saved events yet</h3>
                            <p className="text-text-secondary max-w-md mb-6">
                                Tap the heart icon on any event to save it here for later.
                            </p>
                            <a
                                href="/explore"
                                className="inline-flex items-center justify-center rounded-md bg-brand-accent px-6 py-2 text-sm font-medium text-text-inverse transition-colors hover:bg-brand-accent/90"
                            >
                                Explore Events
                            </a>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
