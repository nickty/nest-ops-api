import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  async check() {
    const checks: Record<string, string> = {};

    // DB check
    try {
      await this.dataSource.query('SELECT 1');
      checks.db = 'up';
    } catch (e) {
      checks.db = 'down';
    }

    const healthy = Object.values(checks).every((v) => v === 'up');
    return {
      status: healthy ? 'ok' : 'degraded',
      checks,
      uptime: process.uptime(),
      pid: process.pid,
    };
  }

  // Liveness = "is the process alive?" — restart if not
  @Get('live')
  live() {
    return { status: 'alive' };
  }

  // Readiness = "can this instance serve traffic?" — remove from ALB if not
  @Get('ready')
  async ready() {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'ready' };
    } catch {
      return { status: 'not-ready' };
    }
  }
}