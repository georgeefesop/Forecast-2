/**
 * Core types for event ingestion system
 */

export interface RawEventStub {
  title: string;
  url: string;
  dateHint?: string; // Raw date string from source
  imageUrl?: string;
}

export interface RawEventDetail {
  title: string;
  description?: string;
  startAt?: Date;
  endAt?: Date;
  venue?: {
    name: string;
    address?: string;
  };
  address?: string;
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
    lat?: number;
    lng?: number;
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

export interface SourceAdapter {
  name: string;
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
