import { Incident, ResponseUnit, ActivityEvent, IncidentType, IncidentStatus, SeverityLevel, UnitType, UnitStatus } from "./types";
import { Database } from "./database.types";

export function toDBIncidentType(uiType: string): string {
  switch (uiType) {
    case "Structure Fire": return "FIRE";
    case "Medical Emergency": return "MEDICAL";
    case "Vehicle Collision": return "CRASH";
    case "Gas Leak": return "HAZMAT";
    case "Infrastructure / Flood": return "HAZMAT"; // mapped to closest allowed type
    case "Hazardous Materials": return "HAZMAT";
    case "Power Grid Surge": return "FIRE"; // mapped to closest allowed type
    default: return "FIRE";
  }
}

export function fromDBIncidentType(dbType: string): IncidentType {
  switch (dbType) {
    case "FIRE": return "Structure Fire";
    case "MEDICAL": return "Medical Emergency";
    case "CRASH": return "Vehicle Collision";
    case "HAZMAT": return "Hazardous Materials";
    default: return "Medical Emergency";
  }
}

export function toDBSeverity(uiSeverity: string): string {
  return uiSeverity.toUpperCase();
}

export function fromDBSeverity(dbSeverity: string): SeverityLevel {
  const map: Record<string, SeverityLevel> = {
    "CRITICAL": "Critical",
    "HIGH": "High",
    "MEDIUM": "Medium",
    "LOW": "Low"
  };
  return map[dbSeverity?.toUpperCase()] || "Medium";
}

export function toDBStatus(uiStatus: string): string {
  const map: Record<string, string> = {
    "Pending": "ACTIVE",
    "Dispatched": "ASSIGNED",
    "On scene": "IN_PROGRESS",
    "Resolved": "RESOLVED"
  };
  return map[uiStatus] || "ACTIVE";
}

export function fromDBStatus(dbStatus: string): IncidentStatus {
  const map: Record<string, IncidentStatus> = {
    "ACTIVE": "Pending",
    "ASSIGNED": "Dispatched",
    "IN_PROGRESS": "On scene",
    "RESOLVED": "Resolved"
  };
  return map[dbStatus?.toUpperCase()] || "Pending";
}


export function toDBUnitStatus(uiStatus: string): string {
  const map: Record<string, string> = {
    "Available": "available",
    "En route": "en_route",
    "On scene": "on_scene",
    "Out of service": "busy"
  };
  return map[uiStatus] || "available";
}

export function fromDBUnitStatus(dbStatus: string): UnitStatus {
  const map: Record<string, UnitStatus> = {
    "available": "Available",
    "en_route": "En route",
    "on_scene": "On scene",
    "busy": "Out of service"
  };
  return map[dbStatus?.toLowerCase()] || "Available";
}

export function mapIncident(dbInc: Database['public']['Tables']['incidents']['Row']): Incident {
  const date = new Date(dbInc.created_at || Date.now());
  const timeReceived = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const timeAgo = diffMins >= 60 ? `${Math.floor(diffMins/60)}h ${diffMins%60}m ago` : `${diffMins}m ago`;

  return {
    id: dbInc.id,
    type: fromDBIncidentType(dbInc.incident_type),
    severity: fromDBSeverity(dbInc.severity),
    location: dbInc.source || "Lat: " + dbInc.latitude?.toFixed(4) + ", Lon: " + dbInc.longitude?.toFixed(4),
    coordinates: {
      lat: dbInc.latitude || 0,
      lon: dbInc.longitude || 0,
    },
    timeReceived,
    timeAgo,
    assignedUnits: [],
    status: fromDBStatus(dbInc.status),
    callerReport: dbInc.description || "No description provided.",
    aiRecommendation: "AI assessment retrieved from ingestion pipeline.",
    duplicateReportsCount: dbInc.report_count || 1,
    timeline: [
      {
        time: timeReceived,
        description: `Incident logged from ${dbInc.source || "System"}`,
        actor: "ML Pipeline"
      }
    ]
  };
}

export function fromDBUnitType(dbType: string): UnitType {
  const map: Record<string, UnitType> = {
    "fire_truck": "Fire & Rescue",
    "rescue_team": "Fire & Rescue",
    "ambulance": "Medical / EMS",
    "police_unit": "Police Support",
    "equipment": "HazMat & Special"
  };
  return map[dbType?.toLowerCase()] || "Public Works";
}

export function mapResource(dbRes: Database['public']['Tables']['resources']['Row']): ResponseUnit {
  return {
    id: dbRes.id,
    callsign: dbRes.name || "Unknown Unit",
    type: fromDBUnitType(dbRes.type),
    status: fromDBUnitStatus(dbRes.status),
    currentLocation: "Tracking via Telemetry...",
    coordinates: { lat: 23.0225, lon: 72.5714 }, // Fallback center or parsed from PostGIS if available
    crewCount: dbRes.capacity || 2,
    vehicleType: Array.isArray(dbRes.capabilities) ? dbRes.capabilities.join(", ") : (typeof dbRes.capabilities === "string" ? dbRes.capabilities : "Standard Unit"),
    equipmentStatus: "Operational",
    batteryFuelPct: 100, // Telemetry will update this from Redis later
  };
}

export function mapAlert(dbAlert: Database['public']['Tables']['alerts']['Row']): ActivityEvent {
  const date = new Date(dbAlert.triggered_at || new Date());
  const timestamp = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return {
    id: dbAlert.id,
    timestamp,
    title: dbAlert.alert_type || "System Alert",
    description: dbAlert.message || "",
    type: "system",
    relatedIncidentId: dbAlert.incident_id,
  };
}
