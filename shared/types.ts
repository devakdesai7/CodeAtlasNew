// shared/types.ts

// --- COMMON TYPES ---
export type Location = {
  lat: number;
  lng: number;
  accuracy_meters?: number;
};

// --- 1. SIMULATION STREAM PAYLOADS (Ingestion Layer) ---
// These are the raw, fragmented data packets sent by the simulator.

export type EmergencyCallPayload = {
  stream_type: "EMERGENCY_CALL";
  timestamp: string;
  caller_id: string;
  location: Location;
  transcript: string;
  ai_keywords: string[];
};

export type CitizenAppPayload = {
  stream_type: "CITIZEN_APP";
  timestamp: string;
  user_id: string;
  location: Location;
  incident_category: string;
  description: string;
  media_url?: string;
};

export type IotSensorPayload = {
  stream_type: "IOT_SENSOR";
  timestamp: string;
  sensor_id: string;
  sensor_type: string;
  location: Location;
  reading: number;
  unit: string;
  status: string;
};

export type UnitTelemetryPayload = {
  stream_type: "UNIT_TELEMETRY";
  timestamp: string;
  unit_id: string;
  unit_type: "FIRE_ENGINE" | "AMBULANCE" | "POLICE_CRUISER" | "HAZMAT";
  status: "AVAILABLE" | "EN_ROUTE" | "ON_SCENE" | "OFF_DUTY";
  location: Location & { heading?: number; speed_mph?: number };
};

// A union type of all possible incoming data streams
export type SimulationPayload =
  | EmergencyCallPayload
  | CitizenAppPayload
  | IotSensorPayload
  | UnitTelemetryPayload;


// --- 2. CORE ENTITIES (Processed Data) ---
// These represent the "Cleaned" state after AI deduplication and processing.

export type IncidentStatus = "OPEN" | "DISPATCHED" | "ESCALATED" | "RESOLVED";

export type Incident = {
  id: string;
  title: string;
  description: string;
  location: Location;
  severity: 1 | 2 | 3 | 4 | 5; // 5 is most severe
  status: IncidentStatus;
  created_at: string;
  updated_at: string;
  source_events: string[]; // IDs of the raw simulation payloads that were clustered to form this incident
};

export type Resource = {
  id: string;
  name: string;
  type: "FIRE_ENGINE" | "AMBULANCE" | "POLICE_CRUISER" | "HAZMAT";
  status: "AVAILABLE" | "EN_ROUTE" | "ON_SCENE" | "OFF_DUTY";
  current_location: Location;
  assigned_incident_id?: string | null;
};

export type Recommendation = {
  incident_id: string;
  recommended_resource_ids: string[];
  estimated_arrival_time_mins: number;
  ai_reasoning: string; // e.g., "Hazmat unit needed due to chemical sensor data."
};
