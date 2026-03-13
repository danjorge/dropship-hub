import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { getRedisConfig, QUEUE_NAMES } from './queues.config';
import { ListingsSyncProcessor } from './processors/listings-sync.processor';
import { StockSyncProcessor } from './processors/stock-sync.processor';
import { OrdersSyncProcessor } from './processors/orders-sync.processor';
import { StockReservationsProcessor } from './processors/stock-reservations.processor';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: getRedisConfig(config),
      }),
    }),
    BullModule.registerQueue(
      { name: QUEUE_NAMES.LISTINGS_SYNC },
      { name: QUEUE_NAMES.STOCK_SYNC },
      { name: QUEUE_NAMES.ORDERS_SYNC },
      { name: QUEUE_NAMES.STOCK_RESERVATIONS },
    ),
    InventoryModule,
  ],
  providers: [
    ListingsSyncProcessor,
    StockSyncProcessor,
    OrdersSyncProcessor,
    StockReservationsProcessor,
  ],
})
export class JobsModule {}
