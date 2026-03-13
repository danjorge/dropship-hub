"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUEUE_NAMES = exports.getRedisConfig = void 0;
const getRedisConfig = (config) => {
    return {
        host: config.get('REDIS_HOST') || 'localhost',
        port: parseInt(config.get('REDIS_PORT') || '6379', 10),
    };
};
exports.getRedisConfig = getRedisConfig;
exports.QUEUE_NAMES = {
    LISTINGS_SYNC: 'listings-sync',
    STOCK_SYNC: 'stock-sync',
    ORDERS_SYNC: 'orders-sync',
    STOCK_RESERVATIONS: 'stock-reservations',
};
//# sourceMappingURL=queues.config.js.map