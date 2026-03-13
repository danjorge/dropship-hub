"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var StockSyncProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockSyncProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const queues_config_1 = require("../queues.config");
let StockSyncProcessor = StockSyncProcessor_1 = class StockSyncProcessor extends bullmq_1.WorkerHost {
    constructor() {
        super(...arguments);
        this.logger = new common_1.Logger(StockSyncProcessor_1.name);
    }
    async process(job) {
        this.logger.log(`Processing stock sync job ${job.id}`);
        const { supplierOrgId } = job.data;
        this.logger.log(`Syncing stock for supplier ${supplierOrgId}`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        this.logger.log(`Completed stock sync job ${job.id}`);
    }
};
exports.StockSyncProcessor = StockSyncProcessor;
exports.StockSyncProcessor = StockSyncProcessor = StockSyncProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(queues_config_1.QUEUE_NAMES.STOCK_SYNC)
], StockSyncProcessor);
//# sourceMappingURL=stock-sync.processor.js.map