"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StockReservationsProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockReservationsProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const queues_config_1 = require("../queues.config");
const stock_reservations_service_1 = require("../../inventory/stock-reservations.service");
let StockReservationsProcessor = StockReservationsProcessor_1 = class StockReservationsProcessor extends bullmq_1.WorkerHost {
    constructor(stockReservations) {
        super();
        this.stockReservations = stockReservations;
        this.logger = new common_1.Logger(StockReservationsProcessor_1.name);
    }
    async process(job) {
        this.logger.log(`Processing stock reservations cleanup job ${job.id}`);
        const released = await this.stockReservations.releaseExpiredReservations();
        this.logger.log(`Released ${released} expired reservations`);
    }
};
exports.StockReservationsProcessor = StockReservationsProcessor;
exports.StockReservationsProcessor = StockReservationsProcessor = StockReservationsProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(queues_config_1.QUEUE_NAMES.STOCK_RESERVATIONS),
    __metadata("design:paramtypes", [stock_reservations_service_1.StockReservationsService])
], StockReservationsProcessor);
//# sourceMappingURL=stock-reservations.processor.js.map