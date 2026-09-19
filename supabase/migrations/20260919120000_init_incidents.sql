-- Enable PostGIS extension for spatial querying
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enum for status
CREATE TYPE incident_status AS ENUM ('OPEN', 'RESOLVED', 'CLOSED');

-- Incidents Table
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR NOT NULL,
    severity INT NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    status incident_status DEFAULT 'OPEN',
    source_events JSONB DEFAULT '[]', -- Array of payload IDs that belong to this incident
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial Index for blazing fast deduplication queries
CREATE INDEX idx_incidents_location ON incidents USING GIST (location);
CREATE INDEX idx_incidents_status ON incidents (status);

-- =========================================================================
-- RPC FUNCTION FOR REAL-TIME DEDUPLICATION (Called from Python backend)
-- =========================================================================
CREATE OR REPLACE FUNCTION find_nearby_incident(p_lat float, p_lng float, p_radius_meters float)
RETURNS SETOF incidents
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM incidents
  WHERE status = 'OPEN'
    -- Only match active incidents from the last 30 minutes
    AND created_at > NOW() - INTERVAL '30 minutes'
    -- PostGIS spatial math: is the distance <= p_radius_meters?
    AND ST_DWithin(
      location,
      ST_MakePoint(p_lng, p_lat)::geography,
      p_radius_meters
    )
  ORDER BY created_at DESC
  LIMIT 1;
END;
$$;
