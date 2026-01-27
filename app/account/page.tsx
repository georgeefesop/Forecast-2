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
                className="border-b-2 border-brand-accent px-4 py-2 text-sm font-medium text-brand-accent transition-colors"
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
                  <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
                  <p className="text-text-secondary">
                    Your recent interactions and submissions will appear here.
                  </p>
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
