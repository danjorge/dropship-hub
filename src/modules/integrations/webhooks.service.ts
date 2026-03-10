import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/db/prisma.service';
import { Provider, FulfillmentStatus } from '@prisma/client';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private prisma: PrismaService) {}

  async handleShopeeWebhook(payload: Record<string, unknown>, signature?: string) {
    this.verifySignature(payload, signature);

    const externalEventId = payload.event_id as string | undefined;
    if (!externalEventId) {
      throw new BadRequestException('Missing event_id in webhook payload');
    }

    const existing = await this.prisma.webhookEvent.findUnique({
      where: {
        provider_externalEventId: {
          provider: Provider.SHOPEE,
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
        provider: Provider.SHOPEE,
        externalEventId,
        payload: payload as never,
      },
    });

    const eventType = payload.event_type as string | undefined;

    if (eventType === 'order_created' || eventType === 'order_updated') {
      await this.processOrderEvent(payload);
    }

    return { status: 'processed' };
  }

  private verifySignature(payload: Record<string, unknown>, signature?: string) {
    if (!signature) {
      this.logger.warn('Webhook received without signature - verification skipped (implement in production)');
      return;
    }

    const timestamp = payload.timestamp as number | undefined;
    if (timestamp) {
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (Math.abs(now - timestamp) > fiveMinutes) {
        this.logger.error('Webhook timestamp too old - possible replay attack');
        throw new BadRequestException('Webhook timestamp expired');
      }
    }
  }

  private async processOrderEvent(payload: Record<string, unknown>) {
    const orderData = payload.order as Record<string, unknown> | undefined;
    if (!orderData) {
      this.logger.warn('No order data in webhook payload');
      return;
    }

    const externalOrderId = orderData.order_id as string;
    const merchantOrgId = orderData.merchant_org_id as string | undefined;

    if (!externalOrderId || !merchantOrgId) {
      this.logger.warn('Missing order_id or merchant_org_id in order data');
      return;
    }

    const existingOrder = await this.prisma.marketplaceOrder.findUnique({
      where: {
        merchantOrgId_provider_externalOrderId: {
          merchantOrgId,
          provider: Provider.SHOPEE,
          externalOrderId,
        },
      },
    });

    const orderStatus = (orderData.status as string) || 'PENDING';
    const buyerName = orderData.buyer_name as string | undefined;
    const shippingAddress = orderData.shipping_address as Record<string, unknown> | undefined;
    const totalCents = orderData.total_cents as number | undefined;

    let order;
    if (existingOrder) {
      order = await this.prisma.marketplaceOrder.update({
        where: { id: existingOrder.id },
        data: {
          status: orderStatus,
          buyerName,
          shippingAddressJson: shippingAddress as never,
          totalCents,
        },
      });
    } else {
      order = await this.prisma.marketplaceOrder.create({
        data: {
          merchantOrgId,
          provider: Provider.SHOPEE,
          externalOrderId,
          status: orderStatus,
          buyerName,
          shippingAddressJson: shippingAddress as never,
          totalCents,
        },
      });
    }

    const items = (orderData.items as Array<Record<string, unknown>>) || [];
    
    for (const item of items) {
      const listingId = item.listing_id as string | undefined;
      const qty = (item.qty as number) || 1;
      const priceCents = (item.price_cents as number) || 0;

      if (!listingId) continue;

      const listing = await this.prisma.listing.findUnique({
        where: { id: listingId },
        select: { supplierOfferId: true, supplierOffer: { select: { supplierOrgId: true } } },
      });

      if (!listing) continue;

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
            status: FulfillmentStatus.NEW,
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
}
