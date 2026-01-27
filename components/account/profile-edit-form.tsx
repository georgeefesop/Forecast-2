"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";

interface ProfileEditFormProps {
  currentHandle: string;
  currentGender?: string | null;
  onUpdate?: () => void;
}

export function ProfileEditForm({ currentHandle, currentGender, onUpdate }: ProfileEditFormProps) {
  const { data: session, update } = useSession();
  const [handle, setHandle] = useState(currentHandle || "");
  const [gender, setGender] = useState(currentGender || "");
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
        credentials: "include",
        body: JSON.stringify({ handle, gender }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update profile");
      }

      // Update session
      await update();

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      onUpdate?.();
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
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
            className="flex-1 rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
            disabled={loading}
            required
          />
        </div>
        <p className="mt-2 text-xs text-text-tertiary">
          3-20 characters, letters, numbers, and underscores only
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Gender
        </label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
          disabled={loading}
        >
          <option value="">Select gender (optional)</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="non_binary">Non-binary</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={loading || (handle === currentHandle && gender === (currentGender || ""))}
        >
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
            "Save Changes"
          )}
        </Button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-semantic-error">{error}</p>
      )}
    </form>
  );
}
