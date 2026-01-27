"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface SavedEventsButtonProps {
    className?: string;
}

export function SavedEventsButton({ className }: SavedEventsButtonProps) {
    const { data: session } = useSession();
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        if (!session) return;

        const fetchCount = async () => {
            try {
                const res = await fetch("/api/account/saved/count");
                const data = await res.json();
                setCount(data.count);
            } catch (err) {
                console.error("Failed to fetch saved count", err);
            }
        };

        fetchCount();

        // Refresh count when window gains focus
        window.addEventListener('focus', fetchCount);
        return () => window.removeEventListener('focus', fetchCount);
    }, [session]);

    if (!session) return null;

    return (
        <Link
            href="/saved"
            className={cn(
                "group flex items-center gap-2 rounded-full border border-border-default bg-background-surface px-4 py-2 text-sm font-medium text-text-primary transition-all hover:border-border-strong hover:bg-background-elevated",
                className
            )}
        >
            <Heart className="h-4 w-4 text-text-primary transition-transform group-hover:scale-110" />
            <span>Saved Events</span>
            {count !== null && count > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center text-sm font-bold text-text-primary">
                    {count}
                </span>
            )}
        </Link>
    );
}
