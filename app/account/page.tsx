"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/components/theme-provider";
import { Bookmark, MessageSquare, Settings, LogOut, User, Shield, Bell } from "lucide-react";
import { SettingsTabContent } from "@/components/account/settings-tab-content";

export default function AccountPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"saved" | "activity" | "settings">(
    "saved"
  );

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="mb-4 text-text-secondary">Please sign in to view your account.</p>
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
              <SettingsTabContent session={session} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
