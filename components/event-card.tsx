"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { HeartButton } from "@/components/event/heart-button";
import { motion, type Variants } from "motion/react";

const MotionLink = motion.create(Link);

interface EventCardProps {
  id: string;
  slug: string;
  title: string;
  startAt: Date;
  venue?: {
    name: string;
    city: string;
  };
  imageUrl?: string;
  interestedCount?: number;
  goingCount?: number;
  category?: string;
  isPromoted?: boolean;
  className?: string;
  sourceName?: string;
  priceMin?: number | null;
  seriesId?: string | null;
  isSeries?: boolean;
  size?: 'small' | 'wide' | 'tall' | 'big' | 'hero';
  index?: number;
}

export function EventCard({
  id,
  slug,
  title,
  startAt,
  venue,
  imageUrl,
  interestedCount = 0,
  goingCount = 0,
  category,
  isPromoted = false,
  className,
  sourceName,
  priceMin,
  seriesId,
  isSeries = false,
  size = 'small',
  isInterested = false,
  index = 0,
}: EventCardProps & { isInterested?: boolean }) {

  const isHero = size === 'hero';

  // Prevent link click when clicking heart
  const onHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const titleContainerRef = useRef<HTMLDivElement>(null);
  const titleTextRef = useRef<HTMLHeadingElement>(null);
  const [scrollDistance, setScrollDistance] = useState(0);

  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Check for touch capability
    if (typeof window !== "undefined") {
      setIsTouch(window.matchMedia("(hover: none) and (pointer: coarse)").matches);
    }
  }, []);

  useEffect(() => {
    if (titleContainerRef.current && titleTextRef.current) {
      const containerWidth = titleContainerRef.current.offsetWidth;
      const textWidth = titleTextRef.current.scrollWidth;
      if (textWidth > containerWidth) {
        setScrollDistance(textWidth - containerWidth + 40); // 40px buffer
      } else {
        setScrollDistance(0);
      }
    }
  }, [title]);

  const entryVariants: Variants = {
    hidden: { opacity: 0, y: 40, scale: 0.98 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: (i % 8) * 0.1 + (Math.random() * 0.05), // Distinct 'one-by-one' stagger, capped to reuse pool
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] // Apple-style 'expo' out
      }
    })
  };

  const cardVariants: Variants = {
    rest: {
      scale: 1,
      y: 0,
      boxShadow: "0 1px 3px 0 rgba(40, 30, 20, 0.08), 0 1px 2px -1px rgba(40, 30, 20, 0.08)"
    },
    hover: {
      transition: { duration: 0.4, ease: "easeOut" }
    },
    tap: {
      scale: 0.99,
      transition: { type: "spring", stiffness: 400, damping: 15 }
    }
  };

  const heroTitleVariants: Variants = {
    rest: { x: 0 },
    hover: {
      x: scrollDistance > 0 ? -scrollDistance : 0,
      transition: {
        duration: scrollDistance > 0 ? scrollDistance / (isHero ? 120 : 60) : 0, // Slower for small cards (60), fast for hero (120)
        ease: "linear",
        repeat: scrollDistance > 0 ? Infinity : 0,
        repeatType: "reverse" as const,
        repeatDelay: 1 // 1 second pause at each end
      }
    }
  };

  const normalizeTitle = (text: string) => {
    if (!text) return text;
    // If it's all caps (and not just single letter/number), normalize to better case
    if (text.length > 3 && text === text.toUpperCase() && text !== text.toLowerCase()) {
      return text.charAt(0) + text.slice(1).toLowerCase();
    }
    return text;
  };

  const displayTitle = normalizeTitle(title);

  const isSpecificEvent = title.toLowerCase().includes("εποχή") || title.toLowerCase().includes("epochi");
  const targetScale = isHero && isSpecificEvent ? 1.05 : 1;

  const imageVariants: Variants = {
    hidden: { scale: targetScale },
    visible: { scale: targetScale },
    hover: {
      scale: targetScale,
      transition: { duration: 0.7, ease: [0.33, 1, 0.68, 1] }
    }
  };

  if (isHero) {
    return (
      <MotionLink
        href={`/event/${slug}`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        custom={index}
        whileHover="hover"
        whileTap="tap"
        variants={{
          ...entryVariants,
          ...cardVariants
        }}
        className={cn(
          "group relative block h-full w-full overflow-hidden rounded-[22px] bg-gray-100 !no-underline transition-all hover:shadow-lg border border-white",
          className
        )}
      >
        <motion.div variants={imageVariants} className="relative h-full w-full">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-200">
              <Calendar className="h-16 w-16 text-gray-400" />
            </div>
          )}
        </motion.div>

        {/* Hero Content Wrapped in Glass */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/20 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-[15px] transition-all duration-500">
          <div className="p-8">
            {isSeries && (
              <span className="inline-block rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold uppercase tracking-wider text-white mb-4">
                Series
              </span>
            )}
            <div ref={titleContainerRef} className="overflow-hidden mb-4 relative max-w-full">
              <motion.h3
                ref={titleTextRef}
                variants={heroTitleVariants}
                animate={isTouch ? "hover" : undefined}
                className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium leading-[1.1] drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)] text-white !whitespace-nowrap inline-block w-max flex-shrink-0"
              >
                {displayTitle}
              </motion.h3>
            </div>
            <div className="flex items-center gap-x-4 gap-y-2 text-white/90 text-base md:text-lg font-medium min-w-0 pr-20">
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Calendar className="h-5 w-5 flex-shrink-0" />
                <time className="whitespace-nowrap">{format(startAt, "EEEE, MMMM d")}</time>
              </div>
              {venue && (
                <div className="flex items-center gap-1.5 min-w-0">
                  <MapPin className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{venue.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Heart - Bottom Right (Absolute, on top of glass) */}
        <div className="absolute bottom-8 right-8 z-10">
          <HeartButton
            eventId={id}
            initialInterestedCount={interestedCount}
            initialIsInterested={isInterested}
            size="lg"
            className="text-white hover:text-red-500 drop-shadow-md"
          />
        </div>
      </MotionLink>
    );
  }

  // Standard / Small Card Layout
  return (
    <MotionLink
      href={`/event/${slug}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      custom={index}
      whileHover="hover"
      whileTap="tap"
      variants={{
        ...entryVariants,
        ...cardVariants
      }}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[18px] bg-bg-surface border border-border-default !no-underline transition-all hover:shadow-lg",
        className
      )}
    >
      {/* Image Area - Fixed 16:9 Aspect */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
        <motion.div variants={imageVariants} className="h-full w-full">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300">
              <Calendar className="h-10 w-10" />
            </div>
          )}
        </motion.div>

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex gap-2 z-10">
          {isSeries && (
            <span className="rounded-full border-t border-white/20 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm drop-shadow-md">
              Series
            </span>
          )}
          {category && (
            <span className="rounded-full border-t border-white/20 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm drop-shadow-md transition-all">
              {category}
            </span>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-4 relative bg-bg-surface z-10 overflow-hidden">
        <div ref={titleContainerRef} className="overflow-hidden mb-2 relative max-w-full">
          <motion.h3
            ref={titleTextRef}
            variants={heroTitleVariants}
            animate={isTouch ? "hover" : undefined}
            className="font-serif font-medium text-[17px] text-text-primary leading-[1.3] group-hover:text-brand-accent transition-colors !whitespace-nowrap inline-block w-max flex-shrink-0"
          >
            {displayTitle}
          </motion.h3>
        </div>

        <div className="space-y-1.5 text-[13px] text-text-secondary mt-auto">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 opacity-70" />
            <time className="font-medium">{format(startAt, "EEE, MMM d • h:mm a")}</time>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 opacity-70" />
            <span className="line-clamp-1 opacity-90">{venue?.name || "Limassol"}</span>
          </div>
        </div>

        {/* Footer: Price Pill */}
        <div className="mt-3 pt-3 border-t border-border-subtle/50 flex items-center justify-between">
          <span className={cn(
            "rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide border",
            !priceMin
              ? "border-transparent bg-brand-accent/10 text-brand-accent"
              : "border-border-default text-text-secondary"
          )}>
            {!priceMin ? "FREE" : `€${Math.round(priceMin)}`}
          </span>

          <HeartButton
            eventId={id}
            initialInterestedCount={interestedCount}
            initialIsInterested={isInterested}
            size="sm"
            className="text-text-tertiary hover:text-red-500 transition-colors"
          />
        </div>
      </div>
    </MotionLink>
  );
}
