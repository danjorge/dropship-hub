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
var StockReservationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockReservationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/db/prisma.service");
const client_1 = require("@prisma/client");
let StockReservationsService = StockReservationsService_1 = class StockReservationsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(StockReservationsService_1.name);
    }
    async createReservation(supplierOfferId, qty, marketplaceOrderId, expiryMinutes = 15) {
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);
        return this.prisma.stockReservation.create({
            data: {
                supplierOfferId,
                marketplaceOrderId,
                qty,
                status: client_1.ReservationStatus.HELD,
                expiresAt,
            },
        });
    }
    async consumeReservation(reservationId) {
        const reservation = await this.prisma.stockReservation.findUnique({
            where: { id: reservationId },
            include: { supplierOffer: true },
        });
        if (!reservation || reservation.status !== client_1.ReservationStatus.HELD) {
            return null;
        }
        await this.prisma.$transaction([
            this.prisma.stockReservation.update({
                where: { id: reservationId },
                data: { status: client_1.ReservationStatus.CONSUMED },
            }),
            this.prisma.supplierOffer.update({
                where: { id: reservation.supplierOfferId },
                data: {
                    stockQty: {
                        decrement: reservation.qty,
                    },
                },
            }),
        ]);
        return reservation;
    }
    async releaseReservation(reservationId) {
        return this.prisma.stockReservation.update({
            where: { id: reservationId },
            data: { status: client_1.ReservationStatus.RELEASED },
        });
    }
    async releaseExpiredReservations() {
        const expired = await this.prisma.stockReservation.findMany({
            where: {
                status: client_1.ReservationStatus.HELD,
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
        this.logger.log(`Found ${expired.length} expired reservations to release`);
        for (const reservation of expired) {
            await this.releaseReservation(reservation.id);
        }
        return expired.length;
    }
};
exports.StockReservationsService = StockReservationsService;
exports.StockReservationsService = StockReservationsService = StockReservationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StockReservationsService);
//# sourceMappingURL=stock-reservations.service.js.map