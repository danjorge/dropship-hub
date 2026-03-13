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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/db/prisma.service");
const client_1 = require("@prisma/client");
const integrations_service_1 = require("../../integrations/integrations.service");
let OrdersService = class OrdersService {
    constructor(prisma, integrationsService) {
        this.prisma = prisma;
        this.integrationsService = integrationsService;
    }
    async getOrders(merchantOrgId, filters) {
        const org = await this.prisma.org.findUnique({
            where: { id: merchantOrgId },
            select: { type: true },
        });
        if (!org || org.type !== client_1.OrgType.MERCHANT) {
            throw new common_1.ForbiddenException('Only MERCHANT orgs can access orders');
        }
        const availableProviders = await this.integrationsService.getAvailableProviders(merchantOrgId);
        if (filters.provider) {
            if (!availableProviders.includes(filters.provider)) {
                throw new common_1.BadRequestException(`Provider ${filters.provider} is not connected. Please connect the marketplace integration first.`);
            }
        }
        const where = {
            merchantOrgId,
        };
        if (availableProviders.length > 0) {
            if (filters.provider) {
                where.provider = filters.provider;
            }
            else {
                where.provider = {
                    in: availableProviders,
                };
            }
        }
        else {
            return {
                providers: [],
                items: [],
                page: filters.page || 1,
                pageSize: filters.pageSize || 20,
                total: 0,
            };
        }
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.search) {
            where.OR = [
                {
                    externalOrderId: {
                        contains: filters.search,
                        mode: 'insensitive',
                    },
                },
                {
                    buyerName: {
                        contains: filters.search,
                        mode: 'insensitive',
                    },
                },
            ];
        }
        if (filters.from || filters.to) {
            where.createdAt = {};
            if (filters.from) {
                where.createdAt.gte = new Date(filters.from);
            }
            if (filters.to) {
                where.createdAt.lte = new Date(filters.to);
            }
        }
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 20;
        const skip = (page - 1) * pageSize;
        const total = await this.prisma.marketplaceOrder.count({ where });
        const orders = await this.prisma.marketplaceOrder.findMany({
            where,
            include: {
                items: {
                    select: {
                        id: true,
                    },
                },
                fulfillments: {
                    select: {
                        status: true,
                        trackingCode: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            skip,
            take: pageSize,
        });
        const items = orders.map((order) => ({
            id: order.id,
            provider: order.provider,
            externalOrderId: order.externalOrderId,
            status: order.status,
            buyerName: order.buyerName,
            totalCents: order.totalCents,
            createdAt: order.createdAt,
            itemsCount: order.items.length,
            fulfillment: order.fulfillments.length > 0
                ? {
                    status: order.fulfillments[0].status,
                    trackingCode: order.fulfillments[0].trackingCode,
                }
                : null,
        }));
        return {
            providers: availableProviders,
            items,
            page,
            pageSize,
            total,
        };
    }
    async getOrderById(merchantOrgId, orderId) {
        const org = await this.prisma.org.findUnique({
            where: { id: merchantOrgId },
            select: { type: true },
        });
        if (!org || org.type !== client_1.OrgType.MERCHANT) {
            throw new common_1.ForbiddenException('Only MERCHANT orgs can access orders');
        }
        const order = await this.prisma.marketplaceOrder.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        listing: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                    },
                },
                fulfillments: {
                    include: {
                        supplier: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.merchantOrgId !== merchantOrgId) {
            throw new common_1.ForbiddenException('Order does not belong to your organization');
        }
        return {
            id: order.id,
            provider: order.provider,
            externalOrderId: order.externalOrderId,
            status: order.status,
            buyerName: order.buyerName,
            shippingAddressJson: order.shippingAddressJson,
            totalCents: order.totalCents,
            createdAt: order.createdAt,
            items: order.items.map((item) => ({
                id: item.id,
                qty: item.qty,
                priceCents: item.priceCents,
                listing: item.listing,
            })),
            fulfillments: order.fulfillments.map((fulfillment) => ({
                id: fulfillment.id,
                status: fulfillment.status,
                trackingCode: fulfillment.trackingCode,
                carrier: fulfillment.carrier,
                shippedAt: fulfillment.shippedAt,
                createdAt: fulfillment.createdAt,
                supplier: fulfillment.supplier,
            })),
        };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        integrations_service_1.IntegrationsService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map