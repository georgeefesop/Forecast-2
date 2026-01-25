"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession, signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/components/theme-provider";
import { MessageSquare, Settings, LogOut, User, Shield, Bell } from "lucide-react";
import { SettingsTabContent } from "@/components/account/settings-tab-content";
import { EventCard } from "@/components/event-card";
import { cn } from "@/lib/utils";

function AccountPageContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get("onboarding") === "true";
  const [activeTab, setActiveTab] = useState<"activity" | "settings">(
    isOnboarding ? "settings" : "activity"
  );

  // Activity state
  const [activityEvents, setActivityEvents] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [timeFilter, setTimeFilter] = useState<"upcoming" | "past">("upcoming");

  // Fetch activity when tab or filter is active
  useEffect(() => {
    if (activeTab === "activity" && session?.user) {
      setLoadingActivity(true);
      fetch(`/api/account/events?time=${timeFilter}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.events) {
            setActivityEvents(data.events);
          }
        })
        .catch((err) => console.error("Failed to fetch activity:", err))
        .finally(() => setLoadingActivity(false));
    }
  }, [activeTab, timeFilter, session]);

  // Auto-scroll to profile section on onboarding
  useEffect(() => {
    if (isOnboarding) {
      setTimeout(() => {
        const profileSection = document.getElementById("profile-section");
        if (profileSection) {
          profileSection.scrollIntoView({ behavior: "smooth", block: "start" });
          profileSection.classList.add("animate-pulse");
          setTimeout(() => {
            profileSection.classList.remove("animate-pulse");
          }, 2000);
        }
      }, 300);
    }
  }, [isOnboarding]);

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-text-secondary">Please sign in to view your account.</p>
            <div className="flex gap-4 justify-center">
              <a
                href="/auth/signin"
                className="inline-flex items-center justify-center rounded-md bg-brand-accent px-6 py-2 text-sm font-medium text-text-inverse transition-colors hover:bg-brand-accent/90"
              >
                Sign in
              </a>
              <a
                href="/auth/signup"
                className="inline-flex items-center justify-center rounded-md border border-border-default bg-background-surface px-6 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-background-elevated"
              >
                Sign up
              </a>
            </div>
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
            My Account
          </h1>

          {/* Tabs */}
          <div className="mb-8 border-b border-border-default">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("activity")}
                className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === "activity"
                  ? "border-brand-accent text-brand-accent"
                  : "border-transparent text-text-secondary hover:text-text-primary"
                  }`}
              >
                <MessageSquare className="mr-2 inline h-4 w-4" />
                My Activity
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === "settings"
                  ? "border-brand-accent text-brand-accent"
                  : "border-transparent text-text-secondary hover:text-text-primary"
                  }`}
              >
                <Settings className="mr-2 inline h-4 w-4" />
                Settings
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "activity" && (
              <div className="space-y-8">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl font-semibold">Interested & Going</h2>

                    {/* Time Filter */}
                    <div className="inline-flex p-1 bg-background-elevated rounded-lg border border-border-default">
                      <button
                        onClick={() => setTimeFilter("upcoming")}
                        className={cn(
                          "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                          timeFilter === "upcoming"
                            ? "bg-brand-accent text-text-inverse shadow-sm"
                            : "text-text-secondary hover:text-text-primary"
                        )}
                      >
                        Upcoming
                      </button>
                      <button
                        onClick={() => setTimeFilter("past")}
                        className={cn(
                          "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                          timeFilter === "past"
                            ? "bg-brand-accent text-text-inverse shadow-sm"
                            : "text-text-secondary hover:text-text-primary"
                        )}
                      >
                        Past
                      </button>
                    </div>
                  </div>

                  {loadingActivity ? (
                    <div className="text-text-secondary">Loading events...</div>
                  ) : activityEvents.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {activityEvents.map((event) => (
                        <EventCard
                          key={event.id}
                          id={event.id}
                          slug={event.slug}
                          title={event.title}
                          startAt={new Date(event.start_at)}
                          venue={event.venue_name ? { name: event.venue_name, city: event.venue_city || event.city } : undefined}
                          imageUrl={event.image_url}
                          interestedCount={event.interested_count}
                          goingCount={event.going_count}
                          category={event.category}
                          sourceName={event.source_name}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-secondary">
                      {timeFilter === "upcoming"
                        ? "You haven't marked any upcoming events as interested or going yet."
                        : "You don't have any past activity."}
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <SettingsTabContent session={session} isOnboarding={isOnboarding} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-text-secondary">Loading...</p>
        </main>
      </div>
    }>
      <AccountPageContent />
    </Suspense>
  );
}
