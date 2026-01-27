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
  savedCount?: number;
  category?: string;
  isPromoted?: boolean;
  className?: string;
  sourceName?: string;
  priceMin?: number | null;
  seriesId?: string | null;
  isSeries?: boolean;
  size?: 'small' | 'wide' | 'tall' | 'big' | 'hero';
  index?: number;
  description?: string;
  imageSizeKb?: number | null;
}

export function EventCard({
  id,
  slug,
  title,
  startAt,
  venue,
  imageUrl,
  savedCount = 0,
  category,
  isPromoted = false,
  className,
  sourceName,
  priceMin,
  seriesId,
  isSeries = false,
  size = 'small',
  isSaved = false,
  index = 0,
  description,
  imageSizeKb,
}: EventCardProps & { isSaved?: boolean }) {

  // Deterministically select a marble placeholder based on id/index
  const placeholderIndex = (index + (id.charCodeAt(0) || 0)) % 5 + 1;
  const placeholderImage = `/placeholders/marble-${placeholderIndex}.png`;

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
  const [imageError, setImageError] = useState(false);

  // Consider image valid if: URL exists, no load error, AND (size is unknown OR size >= 20kb)
  // Raised to 20kb to catch low-quality images (like Amphibia ~14.8kb)
  const isSizeValid = imageSizeKb === null || imageSizeKb === undefined || imageSizeKb >= 20;
  const hasImage = Boolean(imageUrl && !imageError && isSizeValid);


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
        delay: (i % 8) * 0.05 + (Math.random() * 0.02), // Refined faster stagger
        duration: 0.4,
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
        viewport={{ once: true, margin: "200px" }}
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
          {hasImage ? (
            <Image
              src={encodeURI(imageUrl!)}
              alt={title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
              onError={() => setImageError(true)}
              onLoad={() => {
                // Success
              }}
            />
          ) : (
            <>
              <Image
                src={placeholderImage}
                alt=""
                fill
                className="object-cover"
                priority
              />
            </>
          )}
        </motion.div>

        {/* Top-Left Pills (Series & Category) */}
        <div className="absolute top-6 left-6 z-10 flex flex-col items-start gap-2">
          {isSeries && (
            <span className="inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm bg-[#F0EFEA] text-text-primary border border-border-subtle">
              Series
            </span>
          )}
          {category && (
            <span className="inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm bg-[#F0EFEA] text-text-primary border border-border-subtle">
              {category}
            </span>
          )}
        </div>

        {/* Hero Content Wrapped in Glass */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/20 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-[15px] transition-all duration-500">
          <div className="p-8">
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
            {description && (
              <p className="text-white/80 text-sm md:text-base mb-4 line-clamp-1 max-w-[90%] font-medium">
                {description}
              </p>
            )}
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
            initialSavedCount={savedCount}
            initialIsSaved={isSaved}
            size="lg"
            className="text-white drop-shadow-md transition-colors"
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
      viewport={{ once: true, margin: "200px" }}
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
      <div className={cn("relative aspect-[16/9] w-full overflow-hidden", hasImage ? "bg-[#F0EFEA]" : "bg-black")}>
        <motion.div variants={imageVariants} className="relative h-full w-full">
          {hasImage ? (
            <Image
              src={encodeURI(imageUrl!)}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImageError(true)}
              onLoad={(img) => {
                // Success
              }}
            />
          ) : (
            <>
              <Image
                src={placeholderImage}
                alt=""
                fill
                className="object-cover"
              />
            </>
          )}
        </motion.div>

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex gap-2 z-10">
          {isSeries && (
            <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm drop-shadow-md bg-[#F0EFEA] text-text-primary border border-border-subtle">
              Series
            </span>
          )}
          {category && (
            <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm drop-shadow-md transition-all bg-[#F0EFEA] text-text-primary border border-border-subtle">
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
            <MapPin className="h-3.5 w-3.5 opacity-70 flex-shrink-0" />
            <span className="line-clamp-1 opacity-90">{venue?.name || "Limassol"}</span>
          </div>
        </div>

        {/* Footer: Price Pill */}
        <div className="mt-4 flex items-center justify-between">
          <span className={cn(
            "rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider border border-border-default text-text-primary bg-transparent"
          )}>
            {!priceMin ? "FREE" : `€${Math.round(priceMin)}`}
          </span>

          <HeartButton
            eventId={id}
            initialSavedCount={savedCount}
            initialIsSaved={isSaved}
            size="sm"
            className="text-text-primary transition-colors"
          />
        </div>
      </div>
    </MotionLink>
  );
}
