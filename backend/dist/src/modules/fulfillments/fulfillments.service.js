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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FulfillmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/db/prisma.service");
const client_1 = require("@prisma/client");
let FulfillmentsService = class FulfillmentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getFulfillments(supplierOrgId) {
        return this.prisma.fulfillmentOrder.findMany({
            where: { supplierOrgId },
            include: {
                order: {
                    include: {
                        items: true,
                    },
                },
                merchant: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async confirmFulfillment(fulfillmentId, supplierOrgId) {
        const fulfillment = await this.prisma.fulfillmentOrder.findUnique({
            where: { id: fulfillmentId },
        });
        if (!fulfillment) {
            throw new common_1.NotFoundException('Fulfillment not found');
        }
        if (fulfillment.supplierOrgId !== supplierOrgId) {
            throw new common_1.ForbiddenException('Fulfillment does not belong to this org');
        }
        if (fulfillment.status !== client_1.FulfillmentStatus.NEW) {
            throw new common_1.BadRequestException('Fulfillment can only be confirmed when status is NEW');
        }
        return this.prisma.fulfillmentOrder.update({
            where: { id: fulfillmentId },
            data: {
                status: client_1.FulfillmentStatus.CONFIRMED,
            },
            include: {
                order: true,
            },
        });
    }
    async shipFulfillment(fulfillmentId, supplierOrgId, dto) {
        const fulfillment = await this.prisma.fulfillmentOrder.findUnique({
            where: { id: fulfillmentId },
            include: {
                order: true,
            },
        });
        if (!fulfillment) {
            throw new common_1.NotFoundException('Fulfillment not found');
        }
        if (fulfillment.supplierOrgId !== supplierOrgId) {
            throw new common_1.ForbiddenException('Fulfillment does not belong to this org');
        }
        if (fulfillment.status !== client_1.FulfillmentStatus.CONFIRMED) {
            throw new common_1.BadRequestException('Fulfillment must be confirmed before shipping');
        }
        const updated = await this.prisma.fulfillmentOrder.update({
            where: { id: fulfillmentId },
            data: {
                status: client_1.FulfillmentStatus.SHIPPED,
                trackingCode: dto.trackingCode,
                carrier: dto.carrier,
                shippedAt: new Date(),
            },
            include: {
                order: true,
            },
        });
        await this.prisma.marketplaceOrder.update({
            where: { id: fulfillment.marketplaceOrderId },
            data: {
                status: 'SHIPPED',
            },
        });
        return updated;
    }
};
exports.FulfillmentsService = FulfillmentsService;
exports.FulfillmentsService = FulfillmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FulfillmentsService);
//# sourceMappingURL=fulfillments.service.js.map