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

export function generateUnitTelemetry(loc: Location): UnitTelemetryPayload {
  const speed = faker.number.int({ min: 0, max: 120 });
  return {
    stream_type: 'UNIT_TELEMETRY',
    timestamp: new Date().toISOString(),
    location: { ...loc, speed_mph: speed },
    unit_id: faker.vehicle.vin(),
    unit_type: faker.helpers.arrayElement(['FIRE_ENGINE', 'AMBULANCE', 'POLICE_CRUISER', 'HAZMAT']),
    status: faker.helpers.arrayElement(['AVAILABLE', 'EN_ROUTE', 'ON_SCENE', 'OFF_DUTY']),
  };
}
