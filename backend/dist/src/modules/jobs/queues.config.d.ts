import { ConfigService } from '@nestjs/config';
export declare const getRedisConfig: (config: ConfigService) => {
    host: string;
    port: number;
};
export declare const QUEUE_NAMES: {
    LISTINGS_SYNC: string;
    STOCK_SYNC: string;
    ORDERS_SYNC: string;
    STOCK_RESERVATIONS: string;
};
