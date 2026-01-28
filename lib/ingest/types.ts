/**
 * Core types for event ingestion system
 */

export interface RawEventStub {
  title: string;
  url: string;
  dateHint?: string; // Raw date string from source
  imageUrl?: string;
  [key: string]: any; // Allow extra properties for internal adapter use
}

export interface RawEventDetail {
  title: string;
  description?: string;
  startAt?: Date;
  endAt?: Date;
  venue?: {
    name: string;
    address?: string;
    city?: string;
    area?: string;
    type?: string;
    websiteUrl?: string;
    instagramUrl?: string;
    phone?: string;
    email?: string;
  };
  address?: string;
  city?: string; // Explicit city override
  category?: string;
  tags?: string[];
  imageUrl?: string;
  ticketUrl?: string;
  priceMin?: number;
  priceMax?: number;
  currency?: string;
  language?: string;
}

export interface CanonicalEvent {
  title: string;
  description?: string;
  startAt: Date;
  endAt?: Date;
  city: string;
  venue?: {
    name: string;
    address?: string;
    city?: string;
    area?: string;
    lat?: number;
    lng?: number;
    type?: string;
    websiteUrl?: string;
    instagramUrl?: string;
    phone?: string;
    email?: string;
  };
  address?: string;
  lat?: number;
  lng?: number;
  category?: string;
  tags?: string[];
  priceMin?: number;
  priceMax?: number;
  currency?: string;
  imageUrl?: string;
  ticketUrl?: string;
  sourceName: string;
  sourceUrl: string;
  sourceExternalId: string;
  isHighRes?: boolean;
  imageSizeKb?: number;
  language?: string; // 'en', 'el', 'ru' etc.
}

export type ScrapeFrequency = 'daily' | 'weekly';

export interface SourceAdapter {
  name: string;
  frequency?: ScrapeFrequency;
  list(): Promise<RawEventStub[]>;
  detail?(stub: RawEventStub): Promise<RawEventDetail>;
  mapToCanonical(raw: RawEventStub & Partial<RawEventDetail>): CanonicalEvent;
}

export interface IngestRun {
  id: string;
  started_at: Date;
  finished_at?: Date;
  status: 'running' | 'completed' | 'failed';
  total_events: number;
  created_count: number;
  updated_count: number;
  error_count: number;
  errors?: any[];
  source_results?: Record<string, any>;
}
