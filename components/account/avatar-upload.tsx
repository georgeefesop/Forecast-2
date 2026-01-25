"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Upload, X, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateAvatarUrl } from "@/lib/avatar";

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  avatarSource: string | null;
  avatarSeed: string | null;
  userId: string;
  handle: string;
  onAvatarUpdate?: (seed?: string) => void;
}

export function AvatarUpload({
  currentAvatarUrl,
  avatarSource,
  avatarSeed,
  userId,
  handle,
  onAvatarUpdate,
}: AvatarUploadProps) {
  const { data: session, update } = useSession();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentSeed, setCurrentSeed] = useState(avatarSeed);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update seed when prop changes
  useEffect(() => {
    setCurrentSeed(avatarSeed);
  }, [avatarSeed]);

  // Get current avatar (uploaded or generated)
  const currentAvatar =
    avatarSource === "uploaded" && currentAvatarUrl
      ? currentAvatarUrl
      : generateAvatarUrl(currentSeed || userId || handle);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("avatar", file);

      // Upload to API
      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();

      // Update session to reflect new avatar
      await update();

      // Clear preview and file input
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Callback
      onAvatarUpdate?.();
    } catch (err: any) {
      setError(err.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm("Remove your uploaded avatar? It will revert to the generated one.")) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const response = await fetch("/api/profile/avatar", {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove avatar");
      }

      // Update session
      await update();

      // Clear preview
      setPreview(null);

      onAvatarUpdate?.();
    } catch (err: any) {
      setError(err.message || "Failed to remove avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleRegenerate = async () => {
    setUploading(true);
    setError(null);

    try {
      // Generate new random seed
      const newSeed = `${userId || handle}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Update profile to use generated avatar with new seed
      const response = await fetch("/api/profile/avatar/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ seed: newSeed }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to regenerate avatar");
      }

      const data = await response.json();
      
      // Update the seed to trigger avatar regeneration
      setCurrentSeed(data.seed);
      
      // Update avatar without page refresh
      if (onAvatarUpdate) {
        onAvatarUpdate(data.seed);
      }
      
      // Update session
      await update();
      
      // Update the current avatar display
      setPreview(null);
      setUploading(false);
    } catch (err: any) {
      setError(err.message || "Failed to regenerate avatar");
      setUploading(false);
    }
  };

  const displayAvatar = preview || currentAvatar;

  return (
    <div className="space-y-4">
      {/* Avatar Display */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <img
            src={displayAvatar}
            alt="Avatar"
            className="h-24 w-24 rounded-full border-2 border-border-default object-cover"
          />
          {avatarSource === "uploaded" && (
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-text-inverse">
              <Upload className="h-3 w-3" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium text-text-primary">Profile Picture</p>
          <p className="text-sm text-text-secondary">
            {avatarSource === "uploaded"
              ? "You have uploaded a custom avatar"
              : "Using auto-generated avatar"}
          </p>
        </div>
      </div>

      {/* Upload Controls */}
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {preview ? "Change" : "Upload"}
          </Button>

          {avatarSource !== "uploaded" && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRegenerate}
              disabled={uploading}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </Button>
          )}

          {avatarSource === "uploaded" && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemove}
              disabled={uploading}
              className="flex items-center gap-2 text-semantic-error hover:text-semantic-error"
            >
              <X className="h-4 w-4" />
              Remove
            </Button>
          )}
        </div>

        {preview && (
          <Button
            type="button"
            variant="default"
            onClick={handleUpload}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Save Avatar"
            )}
          </Button>
        )}

        {error && (
          <p className="text-sm text-semantic-error">{error}</p>
        )}

        <p className="text-xs text-text-tertiary">
          JPG, PNG, or WebP. Max 5MB. Recommended: 400x400px
        </p>
      </div>
    </div>
  );
}
