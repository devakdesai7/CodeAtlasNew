import { ClusterManager } from './cluster_manager';
import { ApiClient } from './api_client';

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:8000/ingest';
const DISPATCH_INTERVAL_MS = 2000;

class SimulationEngine {
  private clusterManager: ClusterManager;
  private apiClient: ApiClient;
  private intervalId?: NodeJS.Timeout;

  constructor() {
    this.clusterManager = new ClusterManager();
    this.apiClient = new ApiClient(TARGET_URL);
  }

  public start() {
    console.log(`[INFO] Starting Simulation Engine...`);
    console.log(`[INFO] Target Endpoint: ${TARGET_URL}`);
    
    this.intervalId = setInterval(async () => {
      const payload = this.clusterManager.getNextPayload();
      
      console.log(`[ENGINE] Dispatching ${payload.stream_type} at ${payload.location.lat}, ${payload.location.lng}`);
      await this.apiClient.sendPayload(payload);
    }, DISPATCH_INTERVAL_MS);
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      console.log('[INFO] Simulation Engine stopped.');
    }
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
