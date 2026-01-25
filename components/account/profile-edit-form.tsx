"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";

interface ProfileEditFormProps {
  currentHandle: string;
  onUpdate?: () => void;
}

export function ProfileEditForm({ currentHandle, onUpdate }: ProfileEditFormProps) {
  const { data: session, update } = useSession();
  const [handle, setHandle] = useState(currentHandle || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update handle");
      }

      // Update session
      await update();

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      onUpdate?.();
    } catch (err: any) {
      setError(err.message || "Failed to update username");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Username
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="username"
            minLength={3}
            maxLength={20}
            pattern="[a-zA-Z0-9_]+"
            className="flex-1 rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            disabled={loading}
            required
          />
          <Button type="submit" disabled={loading || handle === currentHandle}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : success ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Saved
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-semantic-error">{error}</p>
        )}
        <p className="mt-2 text-xs text-text-tertiary">
          3-20 characters, letters, numbers, and underscores only
        </p>
      </div>
    </form>
  );
}
