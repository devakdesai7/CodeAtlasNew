-- =========================================================================
-- Migration: Add latitude/longitude columns to resources table
-- and enable Supabase Realtime for live map streaming.
-- 
-- RUN THIS IN YOUR SUPABASE SQL EDITOR (Dashboard → SQL Editor → New Query)
-- =========================================================================

-- 1. Add lat/lng columns for frontend-friendly coordinate access
ALTER TABLE resources
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- 2. Seed initial lat/lng from existing PostGIS current_location column
--    (only runs if current_location is a geography/geometry type)
DO $$
BEGIN
  UPDATE resources
  SET
    latitude  = ST_Y(current_location::geometry),
    longitude = ST_X(current_location::geometry)
  WHERE current_location IS NOT NULL
    AND latitude IS NULL;
EXCEPTION WHEN OTHERS THEN
  -- current_location might not be geography type, skip gracefully
  RAISE NOTICE 'Skipping PostGIS seed: %', SQLERRM;
END $$;

-- 3. Enable Supabase Realtime on the resources table (skip if already enabled)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE resources;
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Realtime already enabled for resources table, skipping.';
END $$;
