import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
// import { MetricsModule } from './metrics/metrics.module';
// import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }), 
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: 5432,
      username: process.env.DB_USERNAME || 'app',
      password: process.env.DB_PASSWORD || 'app',
      database: process.env.DB_NAME || 'nest_ops',
      autoLoadEntities: true,
      synchronize: true,
      logging: ['error', 'warn', 'info', 'log'],
      extra: {
        max: 20, // maximum number of connections in the pool
      }
    }),
    ProductsModule,
    // MetricsModule,
    // HealthModule,
  ],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
