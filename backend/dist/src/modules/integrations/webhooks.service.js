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
var WebhooksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/db/prisma.service");
const client_1 = require("@prisma/client");
let WebhooksService = WebhooksService_1 = class WebhooksService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(WebhooksService_1.name);
    }
    async handleShopeeWebhook(payload, signature) {
        this.verifySignature(payload, signature);
        const externalEventId = payload.event_id;
        if (!externalEventId) {
            throw new common_1.BadRequestException('Missing event_id in webhook payload');
        }
        const existing = await this.prisma.webhookEvent.findUnique({
            where: {
                provider_externalEventId: {
                    provider: client_1.Provider.SHOPEE,
                    externalEventId,
                },
            },
        });
        if (existing) {
            this.logger.log(`Webhook event ${externalEventId} already processed (idempotent)`);
            return { status: 'already_processed' };
        }
        await this.prisma.webhookEvent.create({
            data: {
                provider: client_1.Provider.SHOPEE,
                externalEventId,
                payload: payload,
            },
        });
        const eventType = payload.event_type;
        if (eventType === 'order_created' || eventType === 'order_updated') {
            await this.processOrderEvent(payload);
        }
        return { status: 'processed' };
    }
    verifySignature(payload, signature) {
        if (!signature) {
            this.logger.warn('Webhook received without signature - verification skipped (implement in production)');
            return;
        }
        const timestamp = payload.timestamp;
        if (timestamp) {
            const now = Date.now();
            const fiveMinutes = 5 * 60 * 1000;
            if (Math.abs(now - timestamp) > fiveMinutes) {
                this.logger.error('Webhook timestamp too old - possible replay attack');
                throw new common_1.BadRequestException('Webhook timestamp expired');
            }
        }
    }
    async processOrderEvent(payload) {
        const orderData = payload.order;
        if (!orderData) {
            this.logger.warn('No order data in webhook payload');
            return;
        }
        const externalOrderId = orderData.order_id;
        const merchantOrgId = orderData.merchant_org_id;
        if (!externalOrderId || !merchantOrgId) {
            this.logger.warn('Missing order_id or merchant_org_id in order data');
            return;
        }
        const existingOrder = await this.prisma.marketplaceOrder.findUnique({
            where: {
                merchantOrgId_provider_externalOrderId: {
                    merchantOrgId,
                    provider: client_1.Provider.SHOPEE,
                    externalOrderId,
                },
            },
        });
        const orderStatus = orderData.status || 'PENDING';
        const buyerName = orderData.buyer_name;
        const shippingAddress = orderData.shipping_address;
        const totalCents = orderData.total_cents;
        let order;
        if (existingOrder) {
            order = await this.prisma.marketplaceOrder.update({
                where: { id: existingOrder.id },
                data: {
                    status: orderStatus,
                    buyerName,
                    shippingAddressJson: shippingAddress,
                    totalCents,
                },
            });
        }
        else {
            order = await this.prisma.marketplaceOrder.create({
                data: {
                    merchantOrgId,
                    provider: client_1.Provider.SHOPEE,
                    externalOrderId,
                    status: orderStatus,
                    buyerName,
                    shippingAddressJson: shippingAddress,
                    totalCents,
                },
            });
        }
        const items = orderData.items || [];
        for (const item of items) {
            const listingId = item.listing_id;
            const qty = item.qty || 1;
            const priceCents = item.price_cents || 0;
            if (!listingId)
                continue;
            const listing = await this.prisma.listing.findUnique({
                where: { id: listingId },
                select: { supplierOfferId: true, supplierOffer: { select: { supplierOrgId: true } } },
            });
            if (!listing)
                continue;
            await this.prisma.marketplaceOrderItem.create({
                data: {
                    marketplaceOrderId: order.id,
                    listingId,
                    supplierOfferId: listing.supplierOfferId,
                    qty,
                    priceCents,
                },
            });
            const supplierOrgId = listing.supplierOffer.supplierOrgId;
            const existingFulfillment = await this.prisma.fulfillmentOrder.findFirst({
                where: {
                    marketplaceOrderId: order.id,
                    supplierOrgId,
                },
            });
            if (!existingFulfillment) {
                await this.prisma.fulfillmentOrder.create({
                    data: {
                        supplierOrgId,
                        merchantOrgId,
                        marketplaceOrderId: order.id,
                        status: client_1.FulfillmentStatus.NEW,
                    },
                });
            }
            const reservationExpiry = new Date();
            reservationExpiry.setMinutes(reservationExpiry.getMinutes() + 15);
            await this.prisma.stockReservation.create({
                data: {
                    supplierOfferId: listing.supplierOfferId,
                    marketplaceOrderId: order.id,
                    qty,
                    status: 'HELD',
                    expiresAt: reservationExpiry,
                },
            });
        }
        this.logger.log(`Processed order ${externalOrderId} with ${items.length} items`);
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = WebhooksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map