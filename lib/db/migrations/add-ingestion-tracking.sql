-- Add ingestion tracking and last_seen_at to events
-- Migration: Add ingest_runs table and last_seen_at column

-- Ingest runs table for tracking ingestion jobs
CREATE TABLE IF NOT EXISTS ingest_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finished_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  total_events INTEGER DEFAULT 0,
  created_count INTEGER DEFAULT 0,
  updated_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  errors JSONB,
  source_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add last_seen_at to events for tracking when event was last ingested
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE;

-- Create index for archiving logic (find events not seen recently)
CREATE INDEX IF NOT EXISTS idx_events_last_seen_at ON events(last_seen_at);

-- Create index for ingest_runs queries
CREATE INDEX IF NOT EXISTS idx_ingest_runs_started_at ON ingest_runs(started_at DESC);
