import { ClusterManager } from './cluster_manager';
import { UnitSimulator } from './generators';
import { ApiClient } from './api_client';

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:8000/ingest';
const DISPATCH_INTERVAL_MS = 2000;
const TELEMETRY_INTERVAL_MS = 3000; // Unit location updates every 3 seconds

class SimulationEngine {
  private clusterManager: ClusterManager;
  private unitSimulator: UnitSimulator;
  private apiClient: ApiClient;
  private emergencyIntervalId?: NodeJS.Timeout;
  private telemetryIntervalId?: NodeJS.Timeout;

  constructor() {
    this.clusterManager = new ClusterManager();
    this.unitSimulator = new UnitSimulator();
    this.apiClient = new ApiClient(TARGET_URL);
  }

  public start() {
    console.log(`[INFO] Starting Simulation Engine...`);
    console.log(`[INFO] Target Endpoint: ${TARGET_URL}`);
    
    // Loop 1: Emergency events (calls, citizen reports, IoT sensors)
    this.emergencyIntervalId = setInterval(async () => {
      const payload = this.clusterManager.getNextPayload();
      
      console.log(`[ENGINE] Dispatching ${payload.stream_type} at ${payload.location.lat.toFixed(4)}, ${payload.location.lng.toFixed(4)}`);
      await this.apiClient.sendPayload(payload);
    }, DISPATCH_INTERVAL_MS);

    // Loop 2: Unit telemetry (same 10 registered units, drifting positions)
    this.telemetryIntervalId = setInterval(async () => {
      const telemetry = this.unitSimulator.getNextTelemetry();
      
      console.log(`[TELEMETRY] ${telemetry.unit_id.slice(-3)} → ${telemetry.location.lat.toFixed(4)}, ${telemetry.location.lng.toFixed(4)} (${telemetry.status})`);
      await this.apiClient.sendPayload(telemetry);
    }, TELEMETRY_INTERVAL_MS);
  }

  public stop() {
    if (this.emergencyIntervalId) clearInterval(this.emergencyIntervalId);
    if (this.telemetryIntervalId) clearInterval(this.telemetryIntervalId);
    console.log('[INFO] Simulation Engine stopped.');
  }
}

// Start the engine if this script is executed directly
if (require.main === module) {
  const engine = new SimulationEngine();
  engine.start();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    engine.stop();
    process.exit(0);
  });
}
