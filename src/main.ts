import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const bootStart = process.hrtime.bigint();

  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableShutdownHooks(); // graceful shutdown for ECS

  const port = parseInt(process.env.PORT || '3000');
  await app.listen(port);

  const bootMs = Number(process.hrtime.bigint() - bootStart) / 1_000_000;
  Logger.log(`🚀 App loaded in ${bootMs.toFixed(2)}ms on port ${port} (pid ${process.pid})`, 'Bootstrap');
}
bootstrap();
