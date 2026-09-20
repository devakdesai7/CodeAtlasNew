export type SeverityLevel = "Critical" | "High" | "Medium" | "Low";
export type IncidentStatus = "Dispatched" | "En route" | "On scene" | "Assessing" | "Transporting" | "Resolved" | "Pending";
export type IncidentType =
  | "Structure Fire"
  | "Vehicle Collision"
  | "Medical Emergency"
  | "Gas Leak"
  | "Infrastructure / Flood"
  | "Hazardous Materials"
  | "Search & Rescue"
  | "Power Grid Surge";

export interface Incident {
  id: string;
  type: IncidentType;
  severity: SeverityLevel;
  location: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  timeReceived: string; // e.g. "08:14 AM"
  timeAgo: string; // e.g. "12m ago"
  assignedUnits: string[];
  status: IncidentStatus;
  incidentCommander?: string;
  hydrantStatus?: "Adequate (950 GPM)" | "Limited (420 GPM)" | "Dry Hydrant" | "Unverified";
  evacuationRadiusMeters?: number;
  callerReport: string;
  aiRecommendation: string;
  duplicateReportsCount?: number;
  timeline: {
    time: string;
    description: string;
    actor: string;
  }[];
}

export type UnitType = "Fire & Rescue" | "Medical / EMS" | "Police Support" | "HazMat & Special" | "Public Works";
export type UnitStatus = "Available" | "En route" | "On scene" | "Returning" | "Out of service" | "Transporting";

export interface ResponseUnit {
  id: string;
  callsign: string;
  type: UnitType;
  status: UnitStatus;
  currentLocation: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  assignedIncidentId?: string;
  crewCount: number;
  vehicleType: string;
  equipmentStatus: string;
  batteryFuelPct: number;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  title: string;
  description?: string;
  type: "dispatch" | "arrival" | "escalation" | "system" | "resource";
  severity?: SeverityLevel;
  relatedIncidentId?: string;
}

export interface MetricCardData {
  title: string;
  value: string | number;
  change: string;
  iconName: string;
  trend: number[];
  statusColor?: string;
}

export interface NearbyPlace {
  name: string;
  address: string;
  category: string;
  distance_meters?: number;
  lat: number;
  lon: number;
}

export interface RouteInfo {
  distance_km: number;
  duration_minutes: number;
  distance_meters: number;
  duration_seconds: number;
  geometry?: any;
}
