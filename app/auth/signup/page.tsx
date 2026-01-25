"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/nav/main-nav";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [useMagicLink, setUseMagicLink] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      if (useMagicLink) {
        // Magic link automatically creates account
        const result = await signIn("email", {
          email,
          redirect: false,
          callbackUrl: "/",
        });

        if (result?.error) {
          setMessage("Error sending email. Please try again.");
        } else {
          setMessage("Check your email for a sign-in link! Click it to create your account.");
        }
      } else {
        // Password sign-up
        if (password !== confirmPassword) {
          setMessage("Passwords do not match.");
          setIsLoading(false);
          return;
        }

        if (password.length < 8) {
          setMessage("Password must be at least 8 characters.");
          setIsLoading(false);
          return;
        }

        // Create account with password
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.error || "Failed to create account. Please try again.");
        } else {
          // Auto sign in after successful signup
          const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });

          if (result?.ok) {
            router.push("/");
          } else {
            setMessage("Account created! Please sign in.");
            setTimeout(() => {
              router.push("/auth/signin");
            }, 2000);
          }
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
              Create an account
            </h1>
            <p className="mt-2 text-text-secondary">
              {useMagicLink
                ? "Enter your email to receive a magic link"
                : "Enter your email and create a password"}
            </p>
          </div>

          {/* Method Toggle */}
          <div className="flex gap-2 rounded-lg border border-border-default bg-background-surface p-1">
            <button
              type="button"
              onClick={() => {
                setUseMagicLink(false);
                setMessage("");
              }}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                !useMagicLink
                  ? "bg-brand text-text-inverse"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => {
                setUseMagicLink(true);
                setMessage("");
              }}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                useMagicLink
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

            {!useMagicLink && (
              <>
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
                    placeholder="At least 8 characters"
                    className="mt-1 w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                    required
                    minLength={8}
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-text-primary"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="mt-1 w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                    required
                    minLength={8}
                  />
                </div>
              </>
            )}

            {message && (
              <div
                className={`rounded-md p-3 text-sm ${
                  message.includes("Check your email") ||
                  message.includes("Account created")
                    ? "bg-semantic-success/10 text-semantic-success"
                    : "bg-semantic-error/10 text-semantic-error"
                }`}
              >
                {message}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? useMagicLink
                  ? "Sending..."
                  : "Creating account..."
                : useMagicLink
                ? "Send magic link"
                : "Create account"}
            </Button>
          </form>

          <div className="text-center text-sm text-text-secondary">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-brand hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
