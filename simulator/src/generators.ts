import { faker } from '@faker-js/faker';
import {
  Location,
  EmergencyCallPayload,
  CitizenAppPayload,
  IotSensorPayload,
  UnitTelemetryPayload,
} from '../../shared/types';

// ~300m radius in degrees (approximate)
const RADIUS_IN_DEGREES = 0.003;

export function generateLocation(epicenter?: Location): Location {
  if (epicenter) {
    return {
      lat: faker.location.latitude({
        max: epicenter.lat + RADIUS_IN_DEGREES,
        min: epicenter.lat - RADIUS_IN_DEGREES,
      }),
      lng: faker.location.longitude({
        max: epicenter.lng + RADIUS_IN_DEGREES,
        min: epicenter.lng - RADIUS_IN_DEGREES,
      }),
    };
  }
  return {
    lat: faker.location.latitude(),
    lng: faker.location.longitude(),
  };
}

export function generateEmergencyCall(loc: Location): EmergencyCallPayload {
  return {
    stream_type: 'EMERGENCY_CALL',
    timestamp: new Date().toISOString(),
    location: loc,
    caller_id: faker.phone.number(),
    transcript: faker.lorem.sentence(),
    ai_keywords: [faker.lorem.word(), faker.lorem.word()],
  };
}

export function generateCitizenApp(loc: Location): CitizenAppPayload {
  return {
    stream_type: 'CITIZEN_APP',
    timestamp: new Date().toISOString(),
    location: loc,
    user_id: faker.string.uuid(),
    incident_category: faker.helpers.arrayElement(['FIRE', 'MEDICAL', 'POLICE', 'OTHER']),
    description: faker.lorem.sentence(),
    media_url: faker.datatype.boolean() ? faker.image.url() : undefined,
  };
}

export function generateIotSensor(loc: Location): IotSensorPayload {
  return {
    stream_type: 'IOT_SENSOR',
    timestamp: new Date().toISOString(),
    location: loc,
    sensor_id: faker.string.uuid(),
    sensor_type: faker.helpers.arrayElement(['SMOKE', 'HEAT', 'WATER', 'MOTION']),
    reading: faker.number.float({ min: 0, max: 100 }),
    unit: 'level',
    status: 'ALERT'
  };
}

// Real resource units from Supabase resources table
export const REGISTERED_UNITS = [
  { id: '11111111-0000-0000-0000-000000000101', type: 'FIRE_ENGINE' as const, dbType: 'fire_truck', name: 'Engine 1' },
  { id: '11111111-0000-0000-0000-000000000104', type: 'FIRE_ENGINE' as const, dbType: 'fire_truck', name: 'Engine 4' },
  { id: '11111111-0000-0000-0000-000000000108', type: 'FIRE_ENGINE' as const, dbType: 'fire_truck', name: 'Ladder 2' },
  { id: '11111111-0000-0000-0000-000000000302', type: 'AMBULANCE' as const, dbType: 'ambulance', name: 'Medic 2' },
  { id: '11111111-0000-0000-0000-000000000307', type: 'AMBULANCE' as const, dbType: 'ambulance', name: 'Medic 7' },
  { id: '11111111-0000-0000-0000-000000000304', type: 'AMBULANCE' as const, dbType: 'ambulance', name: 'Medic 4' },
  { id: '11111111-0000-0000-0000-000000000612', type: 'POLICE_CRUISER' as const, dbType: 'police_unit', name: 'Patrol 12' },
  { id: '11111111-0000-0000-0000-000000000618', type: 'POLICE_CRUISER' as const, dbType: 'police_unit', name: 'Patrol 18' },
  { id: '11111111-0000-0000-0000-000000000401', type: 'HAZMAT' as const, dbType: 'equipment', name: 'HazMat 1' },
  { id: '11111111-0000-0000-0000-000000000203', type: 'FIRE_ENGINE' as const, dbType: 'rescue_team', name: 'Rescue 3' },
];

/**
 * Stateful simulator that tracks each registered unit's position
 * and drifts it realistically on every tick (~50-200m per update).
 * No new units are ever created — only the 10 registered ones move.
 */
export class UnitSimulator {
  private positions: Map<string, { lat: number; lng: number; status: string }>;

  constructor() {
    this.positions = new Map();
    // Initialize all registered units near Ahmedabad operational area
    for (const unit of REGISTERED_UNITS) {
      this.positions.set(unit.id, {
        lat: faker.location.latitude({ min: 22.95, max: 23.10 }),
        lng: faker.location.longitude({ min: 72.50, max: 72.65 }),
        status: 'AVAILABLE',
      });
    }
  }

  /** Pick a random registered unit, drift its position, return its telemetry. */
  public getNextTelemetry(): UnitTelemetryPayload {
    const unit = faker.helpers.arrayElement(REGISTERED_UNITS);
    const pos = this.positions.get(unit.id)!;

    // Drift position by ~50-200 meters (0.001° ≈ 111m)
    const drift = 0.0015;
    pos.lat += faker.number.float({ min: -drift, max: drift });
    pos.lng += faker.number.float({ min: -drift, max: drift });

    // Occasionally change status
    if (Math.random() < 0.1) {
      pos.status = faker.helpers.arrayElement(['AVAILABLE', 'EN_ROUTE', 'ON_SCENE']);
    }

    const speed = pos.status === 'EN_ROUTE'
      ? faker.number.int({ min: 30, max: 80 })
      : faker.number.int({ min: 0, max: 10 });

    return {
      stream_type: 'UNIT_TELEMETRY',
      timestamp: new Date().toISOString(),
      location: { lat: pos.lat, lng: pos.lng, speed_mph: speed },
      unit_id: unit.id,
      unit_type: unit.type,
      status: pos.status as UnitTelemetryPayload['status'],
    };
  }
}

