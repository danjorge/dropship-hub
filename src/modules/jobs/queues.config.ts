import { ConfigService } from '@nestjs/config';

export const getRedisConfig = (config: ConfigService) => {
  return {
    host: config.get<string>('REDIS_HOST') || 'localhost',
    port: parseInt(config.get<string>('REDIS_PORT') || '6379', 10),
  };
};

export const QUEUE_NAMES = {
  LISTINGS_SYNC: 'listings-sync',
  STOCK_SYNC: 'stock-sync',
  ORDERS_SYNC: 'orders-sync',
  STOCK_RESERVATIONS: 'stock-reservations',
};
