import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { OrgsModule } from './modules/orgs/orgs.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { ListingsModule } from './modules/listings/listings.module';
import { OrdersModule } from './modules/orders/orders.module';
import { FulfillmentsModule } from './modules/fulfillments/fulfillments.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from "./common/db/prisma.module";
import { AuthModule } from './modules/auth/auth.module';
import { DebugModule } from './modules/debug/debug.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { FinanceModule } from './modules/finance/finance.module';
import { validate } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 1000, // Increased for very large bulk imports
    }]),
    UsersModule,
    OrgsModule,
    CatalogModule,
    ListingsModule,
    OrdersModule,
    FulfillmentsModule,
    IntegrationsModule,
    InventoryModule,
    // JobsModule, // Temporarily disabled - requires Redis
    DashboardModule,
    FinanceModule,
    HealthModule,
    PrismaModule,
    AuthModule,
    DebugModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
