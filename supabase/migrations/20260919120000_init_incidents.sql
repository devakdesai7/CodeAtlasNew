-- =========================================================================
-- CodeAtlas Emergency Response Platform — Database Schema
-- This migration matches the ACTUAL deployed Supabase table structure.
-- =========================================================================

-- Incidents Table
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_type VARCHAR NOT NULL,
    description TEXT,
    source VARCHAR NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    classification_confidence DOUBLE PRECISION,
    severity VARCHAR NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    priority_level VARCHAR,
    status VARCHAR NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISPATCHED', 'RESOLVED', 'CLOSED')),
    is_consolidated BOOLEAN DEFAULT FALSE,
    report_count INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    ai_recommendation TEXT,
    recommended_units JSONB,
    source_events JSONB DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents (status);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents (created_at);

-- Resources Table
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    status VARCHAR DEFAULT 'available',
    capacity INT,
    capabilities JSONB DEFAULT '{}',
    current_location TEXT,
    home_base_location TEXT,
    assigned_profile_id UUID,
    organization VARCHAR,
    contact_info JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- RPC FUNCTION FOR REAL-TIME DEDUPLICATION (Called from Python backend)
-- Returns a flat row with latitude/longitude that the Python code expects.
-- =========================================================================
CREATE OR REPLACE FUNCTION find_nearby_incident(p_lat float, p_lng float, p_radius_meters float)
RETURNS TABLE (
    id UUID,
    incident_type VARCHAR,
    severity VARCHAR,
    source_events JSONB,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    i.incident_type,
    i.severity,
    i.source_events,
    i.latitude,
    i.longitude
  FROM incidents i
  WHERE i.status = 'ACTIVE'
    -- Only match active incidents from the last 30 minutes
    AND i.created_at > NOW() - INTERVAL '30 minutes'
    -- Simple Euclidean distance approximation (in degrees, ~111km per degree)
    -- For a proper solution, enable PostGIS and use ST_DWithin
    AND SQRT(POWER(i.latitude - p_lat, 2) + POWER(i.longitude - p_lng, 2)) * 111000 <= p_radius_meters
  ORDER BY i.created_at DESC
  LIMIT 1;
END;
$$;
