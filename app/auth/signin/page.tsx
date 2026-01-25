"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/nav/main-nav";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [method, setMethod] = useState<"password" | "email">("password");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      if (method === "password") {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setMessage("Invalid email or password. Please try again.");
        } else if (result?.ok) {
          window.location.href = "/";
        }
      } else {
        const result = await signIn("email", {
          email,
          redirect: false,
          callbackUrl: "/",
        });

        if (result?.error) {
          setMessage("Error sending email. Please try again.");
        } else {
          setMessage("Check your email for a sign-in link!");
        }
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-fluid-3xl font-bold text-text-primary">
              Sign in to Forecast
            </h1>
            <p className="mt-2 text-text-secondary">
              {method === "password"
                ? "Enter your email and password"
                : "Enter your email to receive a magic link"}
            </p>
          </div>

          {/* Method Toggle */}
          <div className="flex gap-2 rounded-lg border border-border-default bg-background-surface p-1">
            <button
              type="button"
              onClick={() => {
                setMethod("password");
                setMessage("");
              }}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                method === "password"
                  ? "bg-brand text-text-inverse"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => {
                setMethod("email");
                setMessage("");
              }}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                method === "email"
                  ? "bg-brand text-text-inverse"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Magic Link
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text-primary"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                required
              />
            </div>

            {method === "password" && (
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-text-primary"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="mt-1 w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  required
                />
              </div>
            )}

            {message && (
              <div
                className={`rounded-md p-3 text-sm ${
                  message.includes("Check your email")
                    ? "bg-semantic-success/10 text-semantic-success"
                    : "bg-semantic-error/10 text-semantic-error"
                }`}
              >
                {message}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? method === "password"
                  ? "Signing in..."
                  : "Sending..."
                : method === "password"
                ? "Sign in"
                : "Send magic link"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
