"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/components/theme-provider";
import { Bookmark, MessageSquare, Star, Settings } from "lucide-react";

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
              <div className="space-y-6">
                <div>
                  <h2 className="mb-4 text-xl font-semibold text-text-primary">
                    Appearance
                  </h2>
                  <div className="flex items-center justify-between rounded-lg border border-border-default bg-background-surface p-4">
                    <div>
                      <p className="font-medium text-text-primary">Theme</p>
                      <p className="text-sm text-text-secondary">
                        Choose light or dark mode
                      </p>
                    </div>
                    <ThemeToggle />
                  </div>
                </div>

                <div>
                  <h2 className="mb-4 text-xl font-semibold text-text-primary">
                    Privacy
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-border-default bg-background-surface p-4">
                      <div>
                        <p className="font-medium text-text-primary">
                          Show my "Going" publicly
                        </p>
                        <p className="text-sm text-text-secondary">
                          Allow others to see when you're going to events
                        </p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          defaultChecked={false}
                        />
                        <div className="peer h-6 w-11 rounded-full bg-background-elevated after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border-default after:bg-background-base after:transition-all after:content-[''] peer-checked:bg-brand peer-checked:after:translate-x-full peer-checked:after:border-brand"></div>
                      </label>
                    </div>
                  </div>
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
