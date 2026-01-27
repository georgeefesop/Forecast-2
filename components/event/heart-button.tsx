'use client';

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { toggleSave } from '@/lib/actions/interactions';
import { usePathname } from 'next/navigation';

interface HeartButtonProps {
    eventId: string;
    initialSavedCount: number;
    initialIsSaved: boolean;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function HeartButton({
    eventId,
    initialSavedCount,
    initialIsSaved,
    className,
    size = 'md'
}: HeartButtonProps) {
    const [isSaved, setIsSaved] = useState(initialIsSaved);
    const [count, setCount] = useState(initialSavedCount);
    const [isPending, startTransition] = useTransition();
    const pathname = usePathname();

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation();

        // Optimistic update
        const newIsSaved = !isSaved;
        setIsSaved(newIsSaved);
        setCount(prev => newIsSaved ? prev + 1 : Math.max(0, prev - 1));

        startTransition(async () => {
            const result = await toggleSave(eventId, pathname);

            if (result.error) {
                // Revert on error
                setIsSaved(!newIsSaved);
                setCount(prev => !newIsSaved ? prev + 1 : Math.max(0, prev - 1));
                // TODO: Show toast error (login required, etc)
                if (result.error === 'authentication_required') {
                    // Redirect to login or show alert
                    window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`;
                }
            }
        });
    };

    const iconSizes = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6'
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={cn(
                "group relative flex items-center gap-1.5 transition-all focus:outline-none",
                // Invisible Hit Area Expansion (Pseudo-element)
                "before:absolute before:-inset-3 before:content-[''] before:z-0",
                // isPending && "opacity-70 cursor-not-allowed", // Removed to prevent "cancel" cursor flicker
                className
            )}
            aria-label={isSaved ? "Remove from saved" : "Save event"}
        >
            {/* Motion Flourish Count (Left Side) */}
            <div className="overflow-hidden flex order-first">
                <AnimatePresence mode="popLayout">
                    {count > 0 && (
                        <motion.span
                            key="count"
                            initial={{ y: 15, opacity: 0, scale: 0.8 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 15, opacity: 0, scale: 0.8 }}
                            transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                                mass: 1
                            }}
                            className={cn(
                                "block text-xs font-bold tabular-nums whitespace-nowrap mr-1.5 !no-underline group-hover:no-underline",
                                "text-inherit"
                            )}
                        >
                            {count}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            <Heart
                className={cn(
                    iconSizes[size],
                    "transition-all duration-300 cubic-bezier(0.175, 0.885, 0.32, 1.275)", // Bouncy spring
                    isSaved
                        ? "fill-red-500 text-red-500 scale-110"
                        : "text-inherit group-hover:text-red-500",
                    "group-active:scale-90" // Tactile click press
                )}
            />
        </button >
    );
}
