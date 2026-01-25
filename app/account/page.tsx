"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession, signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/components/theme-provider";
import { Bookmark, MessageSquare, Settings, LogOut, User, Shield, Bell } from "lucide-react";
import { SettingsTabContent } from "@/components/account/settings-tab-content";

function AccountPageContent() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get("onboarding") === "true";
  const [activeTab, setActiveTab] = useState<"saved" | "activity" | "settings">(
    isOnboarding ? "settings" : "saved"
  );
  
  // Auto-scroll to profile section on onboarding
  useEffect(() => {
    if (isOnboarding) {
      setTimeout(() => {
        const profileSection = document.getElementById("profile-section");
        if (profileSection) {
          profileSection.scrollIntoView({ behavior: "smooth", block: "start" });
          // Add highlight animation
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
                className="inline-flex items-center justify-center rounded-md bg-brand px-6 py-2 text-sm font-medium text-text-inverse transition-colors hover:bg-brand/90"
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
                onClick={() => setActiveTab("saved")}
                className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "saved"
                    ? "border-brand text-brand"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                <Bookmark className="mr-2 inline h-4 w-4" />
                Saved
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "activity"
                    ? "border-brand text-brand"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                <MessageSquare className="mr-2 inline h-4 w-4" />
                My Activity
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "settings"
                    ? "border-brand text-brand"
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
            {activeTab === "saved" && (
              <div>
                <p className="text-text-secondary">Your saved events will appear here.</p>
              </div>
            )}

            {activeTab === "activity" && (
              <div>
                <p className="text-text-secondary">Your submissions, comments, and vibe checks will appear here.</p>
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
