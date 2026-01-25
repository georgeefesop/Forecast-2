"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function OrganizerPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"venues" | "events" | "promote">(
    "venues"
  );
  const [venues, setVenues] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "venues") {
        const response = await fetch("/api/organizer/venues");
        if (response.ok) {
          const data = await response.json();
          setVenues(data);
        }
      } else if (activeTab === "events") {
        const response = await fetch("/api/organizer/events");
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="mb-4 text-text-secondary">
              Please sign in to access the organizer dashboard.
            </p>
            <a href="/auth/signin" className="text-brand hover:underline">
              Sign in
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-fluid-3xl font-bold text-text-primary">
            Organizer Dashboard
          </h1>

          {/* Tabs */}
          <div className="mb-8 border-b border-border-default">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("venues")}
                className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "venues"
                    ? "border-brand text-brand"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                <MapPin className="mr-2 inline h-4 w-4" />
                Venues
              </button>
              <button
                onClick={() => setActiveTab("events")}
                className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "events"
                    ? "border-brand text-brand"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                <Plus className="mr-2 inline h-4 w-4" />
                Events
              </button>
              <button
                onClick={() => setActiveTab("promote")}
                className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "promote"
                    ? "border-brand text-brand"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                <TrendingUp className="mr-2 inline h-4 w-4" />
                Promote
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "venues" && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-text-primary">
                    My Venues
                  </h2>
                  <Link href="/organizer/claim">
                    <Button>Claim a Venue</Button>
                  </Link>
                </div>
                {loading ? (
                  <p className="text-text-secondary">Loading...</p>
                ) : venues.length === 0 ? (
                  <div className="rounded-lg border border-border-default bg-background-surface p-8 text-center">
                    <p className="mb-4 text-text-secondary">
                      You haven't claimed any venues yet.
                    </p>
                    <Link href="/organizer/claim">
                      <Button>Claim Your First Venue</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {venues.map((venue) => (
                      <div
                        key={venue.id}
                        className="rounded-lg border border-border-default bg-background-surface p-6"
                      >
                        <h3 className="mb-2 font-semibold text-text-primary">
                          {venue.name}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {venue.city}
                        </p>
                        <p className="mt-2 text-xs text-text-tertiary">
                          Status: {venue.claim_status}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "events" && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-text-primary">
                    My Events
                  </h2>
                  <Link href="/submit">
                    <Button>Create Event</Button>
                  </Link>
                </div>
                {loading ? (
                  <p className="text-text-secondary">Loading...</p>
                ) : events.length === 0 ? (
                  <div className="rounded-lg border border-border-default bg-background-surface p-8 text-center">
                    <p className="mb-4 text-text-secondary">
                      You haven't created any events yet.
                    </p>
                    <Link href="/submit">
                      <Button>Create Your First Event</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between rounded-lg border border-border-default bg-background-surface p-4"
                      >
                        <div>
                          <h3 className="font-semibold text-text-primary">
                            {event.title}
                          </h3>
                          <p className="text-sm text-text-secondary">
                            {new Date(event.start_at).toLocaleDateString()}
                          </p>
                          <p className="mt-1 text-xs text-text-tertiary">
                            Status: {event.status}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/event/${event.slug}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                          <Link href={`/boost/new?event=${event.id}`}>
                            <Button variant="outline" size="sm">
                              Promote
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "promote" && (
              <div>
                <h2 className="mb-6 text-xl font-semibold text-text-primary">
                  Promote Your Events & Venues
                </h2>
                <div className="rounded-lg border border-border-default bg-background-surface p-8 text-center">
                  <p className="mb-4 text-text-secondary">
                    Boost visibility for your events and venues.
                  </p>
                  <Link href="/boost/new">
                    <Button>Start Promotion Campaign</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
