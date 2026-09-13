import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { httpHistogram, requestCounter } from './metrics.middleware';

@Controller('metrics')
export class MetricsController {
  @Get()
  metrics() {
    const counters = Object.fromEntries(requestCounter);
    const lastLatency = Object.fromEntries(httpHistogram);
    return {
      counters,
      lastLatencyMs: lastLatency,
      uptimeSec: process.uptime(),
      memoryMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
      pid: process.pid,
      nodeVersion: process.version,
    };
  }
}