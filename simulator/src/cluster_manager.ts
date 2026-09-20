import {
  generateLocation,
  generateEmergencyCall,
  generateCitizenApp,
  generateIotSensor,
} from './generators';
import { Location } from '../../shared/types';
import { faker } from '@faker-js/faker';

export class ClusterManager {
  private activeCluster: {
    epicenter: Location;
    eventsRemaining: number;
    endTime: number;
  } | null = null;

  public getNextPayload(): any {
    const now = Date.now();

    // Check if current cluster expired or exhausted
    if (this.activeCluster) {
      if (this.activeCluster.eventsRemaining <= 0 || now > this.activeCluster.endTime) {
        this.activeCluster = null;
      }
    }

    // 10% chance to start a new cluster if none is active
    if (!this.activeCluster && Math.random() < 0.1) {
      this.activeCluster = {
        // e.g., somewhere in Mumbai (19.0760, 72.8777) approx
        epicenter: {
          lat: faker.location.latitude({ min: 18.9, max: 19.2 }),
          lng: faker.location.longitude({ min: 72.8, max: 73.0 }),
        },
        eventsRemaining: faker.number.int({ min: 3, max: 5 }),
        endTime: now + 2 * 60 * 1000, // 2-minute window
      };
    }

    let isClusterEvent = this.activeCluster !== null && Math.random() < 0.7; // Bias towards cluster if active
    
    // For test_clusters.ts to always emit cluster events when forced
    if (this.activeCluster && this.activeCluster.eventsRemaining > 0 && process.env.FORCE_CLUSTER_EVENTS === 'true') {
      isClusterEvent = true;
    }

    let loc: Location;
    if (isClusterEvent && this.activeCluster) {
      loc = generateLocation(this.activeCluster.epicenter);
      this.activeCluster.eventsRemaining--;
    } else {
      loc = generateLocation(); // Random noise
    }

    // Pick a payload type
    const type = faker.helpers.arrayElement(['EMERGENCY_CALL', 'CITIZEN_APP', 'IOT_SENSOR']);
    switch (type) {
      case 'EMERGENCY_CALL':
        return generateEmergencyCall(loc);
      case 'CITIZEN_APP':
        return generateCitizenApp(loc);
      case 'IOT_SENSOR':
        return generateIotSensor(loc);
    }
  }

  // Force a cluster for testing purposes
  public forceCluster() {
    this.activeCluster = {
      epicenter: {
        lat: faker.location.latitude({ min: 18.9, max: 19.2 }),
        lng: faker.location.longitude({ min: 72.8, max: 73.0 }),
      },
      eventsRemaining: 5,
      endTime: Date.now() + 2 * 60 * 1000,
    };
  }
}
