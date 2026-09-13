import cluster from 'cluster';
import os from 'os';
import { Logger } from '@nestjs/common';

const numCPUs = parseInt(process.env.WORKER_COUNT || '') || os.availableParallelism();


export function startCluster(bootstrap: () => Promise<void>): void {
  if (cluster.isPrimary) {
    Logger.log(`🧠 Primary ${process.pid} is running — forking ${numCPUs} workers`, 'Cluster');

    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      Logger.warn(`💀 Worker ${worker.process.pid} died (code=${code}, signal=${signal}). Respawning...`, 'Cluster');
      cluster.fork();
    });
  } else {
    Logger.log(`👷 Worker ${process.pid} started`, 'Cluster');
    bootstrap();
  }
}