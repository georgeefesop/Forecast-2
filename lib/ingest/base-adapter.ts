/**
 * Base adapter interface for event ingestion sources
 */

export interface NormalizedEvent {
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
}

export interface EventAdapter {
  name: string;
  fetchEvents(): Promise<NormalizedEvent[]>;
}
