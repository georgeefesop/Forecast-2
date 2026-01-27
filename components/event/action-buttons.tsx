"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleSave } from '@/lib/actions/interactions';
import { cn } from "@/lib/utils";

interface ActionButtonsProps {
  eventId: string;
  initialIsSaved?: boolean;
  savedCount?: number;
}

export function ActionButtons({
  eventId,
  initialIsSaved = false,
  savedCount = 0,
}: ActionButtonsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [count, setCount] = useState(savedCount);
  const [isPending, startTransition] = useTransition();

  const handleToggleSave = async () => {
    if (!session) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    // Optimistic update
    const newValue = !isSaved;
    setIsSaved(newValue);
    setCount(prev => newValue ? prev + 1 : Math.max(0, prev - 1));

    startTransition(async () => {
      const result = await toggleSave(eventId, pathname);
      if (result.error) {
        // Revert
        setIsSaved(!newValue);
        setCount(prev => !newValue ? prev + 1 : Math.max(0, prev - 1));
      }
    });
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;

    const currentUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this event",
          url: currentUrl,
        });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(currentUrl);
        // Could show a toast here
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
      }
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant={isSaved ? "default" : "outline"}
          onClick={handleToggleSave}
          disabled={isPending}
          className={cn(isSaved && "bg-red-500 hover:bg-red-600 text-white border-red-500")}
        >
          <Heart className={cn("mr-2 h-4 w-4", isSaved ? "fill-current" : "")} />
          {isSaved ? "Saved" : "Save"}
        </Button>

        <Button variant="outline" onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>

      {/* Counts */}
      {count > 0 && (
        <div className="text-sm text-text-secondary font-medium">
          {count} people saved this
        </div>
      )}
    </div>
  );
}
