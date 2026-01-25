"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/nav/main-nav";

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!handle.trim()) {
      setError("Handle is required");
      return;
    }

    if (handle.length < 3 || handle.length > 20) {
      setError("Handle must be between 3 and 20 characters");
      return;
    }

    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update profile");
      }

      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-fluid-3xl font-bold text-text-primary">
              Welcome to Forecast
            </h1>
            <p className="mt-2 text-text-secondary">
              Choose a handle to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="handle"
                className="block text-sm font-medium text-text-primary"
              >
                Handle
              </label>
              <input
                id="handle"
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="your_handle"
                className="mt-1 w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_]+"
                required
              />
              <p className="mt-1 text-xs text-text-tertiary">
                3-20 characters, letters, numbers, and underscores only
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-semantic-error/10 p-3 text-sm text-semantic-error">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
