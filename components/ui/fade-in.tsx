"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";


interface FadeInProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
    fullWidth?: boolean;
}

export function FadeIn({
    children,
    className,
    delay = 0,
    duration = 0.5,
    direction = "up",
    fullWidth = false,
}: FadeInProps) {
    const directions = {
        up: { y: 20, x: 0 },
        down: { y: -20, x: 0 },
        left: { x: 20, y: 0 },
        right: { x: -20, y: 0 },
        none: { x: 0, y: 0 },
    };

    return (
        <motion.div
            initial={{
                opacity: 0,
                ...directions[direction]
            }}
            whileInView={{
                opacity: 1,
                x: 0,
                y: 0
            }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
                duration,
                delay,
                ease: [0.21, 0.47, 0.32, 0.98]
            }}
            className={cn(fullWidth ? "w-full" : "", className)}
        >
            {children}
        </motion.div>
    );
}
