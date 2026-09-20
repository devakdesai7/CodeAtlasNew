import { ClusterManager } from './cluster_manager';

function run() {
  console.log('Testing Spatio-Temporal Clustering...\n');
  const manager = new ClusterManager();
  
  // Force a cluster to guarantee clustered output
  manager.forceCluster();

  const payloads = [];
  for (let i = 0; i < 3; i++) {
    payloads.push(manager.getNextPayload());
  }

  payloads.forEach((p, idx) => {
    console.log(`Payload ${idx + 1} (${p.type}):`);
    console.log(`Timestamp: ${p.timestamp}`);
    console.log(`Latitude:  ${p.location.latitude}`);
    console.log(`Longitude: ${p.location.longitude}`);
    console.log('---');
  });
}

run();
