"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const config_1 = require("@nestjs/config");
const queues_config_1 = require("./queues.config");
const listings_sync_processor_1 = require("./processors/listings-sync.processor");
const stock_sync_processor_1 = require("./processors/stock-sync.processor");
const orders_sync_processor_1 = require("./processors/orders-sync.processor");
const stock_reservations_processor_1 = require("./processors/stock-reservations.processor");
const inventory_module_1 = require("../inventory/inventory.module");
let JobsModule = class JobsModule {
};
exports.JobsModule = JobsModule;
exports.JobsModule = JobsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    connection: (0, queues_config_1.getRedisConfig)(config),
                }),
            }),
            bullmq_1.BullModule.registerQueue({ name: queues_config_1.QUEUE_NAMES.LISTINGS_SYNC }, { name: queues_config_1.QUEUE_NAMES.STOCK_SYNC }, { name: queues_config_1.QUEUE_NAMES.ORDERS_SYNC }, { name: queues_config_1.QUEUE_NAMES.STOCK_RESERVATIONS }),
            inventory_module_1.InventoryModule,
        ],
        providers: [
            listings_sync_processor_1.ListingsSyncProcessor,
            stock_sync_processor_1.StockSyncProcessor,
            orders_sync_processor_1.OrdersSyncProcessor,
            stock_reservations_processor_1.StockReservationsProcessor,
        ],
    })
], JobsModule);
//# sourceMappingURL=jobs.module.js.map