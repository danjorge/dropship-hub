import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/db/prisma.service';
import { OrgType, Provider, OrderPaymentStatus } from '@prisma/client';
import { GetOrdersDto } from '../dto/get-orders.dto';
import { IntegrationsService } from '../../integrations/integrations.service';
import { FinanceService } from '../../finance/finance.service';

export interface OrdersResponse {
  providers: Provider[];
  items: Array<{
    id: string;
    provider: Provider;
    externalOrderId: string;
    status: string;
    paymentStatus: OrderPaymentStatus;
    buyerName: string | null;
    totalCents: number | null;
    createdAt: Date;
    itemsCount: number;
    fulfillment: {
      status: string;
      trackingCode: string | null;
    } | null;
  }>;
  page: number;
  pageSize: number;
  total: number;
}

export interface OrderDetailsResponse {
  id: string;
  provider: Provider;
  externalOrderId: string;
  status: string;
  buyerName: string | null;
  shippingAddressJson: any;
  totalCents: number | null;
  createdAt: Date;
  items: Array<{
    id: string;
    qty: number;
    priceCents: number;
    listing: {
      id: string;
      title: string;
    } | null;
  }>;
  fulfillments: Array<{
    id: string;
    status: string;
    trackingCode: string | null;
    carrier: string | null;
    shippedAt: Date | null;
    createdAt: Date;
    supplier: {
      id: string;
      name: string;
    };
  }>;
}

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private integrationsService: IntegrationsService,
    private financeService: FinanceService,
  ) {}

  async getOrders(
    merchantOrgId: string,
    filters: GetOrdersDto,
  ): Promise<OrdersResponse> {
    // Verify org is MERCHANT
    const org = await this.prisma.org.findUnique({
      where: { id: merchantOrgId },
      select: { type: true },
    });

    if (!org || org.type !== OrgType.MERCHANT) {
      throw new ForbiddenException('Only MERCHANT orgs can access orders');
    }

    // Get available providers (connected integrations)
    const availableProviders = await this.integrationsService.getAvailableProviders(
      merchantOrgId,
    );

    // If provider filter is specified, validate it's connected
    if (filters.provider) {
      if (!availableProviders.includes(filters.provider)) {
        throw new BadRequestException(
          `Provider ${filters.provider} is not connected. Please connect the marketplace integration first.`,
        );
      }
    }

    // Build where clause
    const where: any = {
      merchantOrgId,
    };

    // Only show orders for connected providers
    if (availableProviders.length > 0) {
      if (filters.provider) {
        // Filter by specific provider if requested
        where.provider = filters.provider;
      } else {
        // Show all orders from connected providers
        where.provider = {
          in: availableProviders,
        };
      }
    } else {
      // No integrations connected, return empty
      return {
        providers: [],
        items: [],
        page: filters.page || 1,
        pageSize: filters.pageSize || 20,
        total: 0,
      };
    }

    // Apply additional filters
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

    // Calculate pagination
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const skip = (page - 1) * pageSize;

    // Get total count
    const total = await this.prisma.marketplaceOrder.count({ where });

    // Fetch orders with items count and fulfillment summary
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
          take: 1, // Get most recent fulfillment
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: pageSize,
    });

    // Transform to response format
    const items = orders.map((order) => ({
      id: order.id,
      provider: order.provider,
      externalOrderId: order.externalOrderId,
      status: order.status,
      paymentStatus: order.paymentStatus,
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

  async getOrderById(
    merchantOrgId: string,
    orderId: string,
  ): Promise<OrderDetailsResponse> {
    // Verify org is MERCHANT
    const org = await this.prisma.org.findUnique({
      where: { id: merchantOrgId },
      select: { type: true },
    });

    if (!org || org.type !== OrgType.MERCHANT) {
      throw new ForbiddenException('Only MERCHANT orgs can access orders');
    }

    // Fetch order with full details
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
      throw new NotFoundException('Order not found');
    }

    // Verify order belongs to the merchant org
    if (order.merchantOrgId !== merchantOrgId) {
      throw new ForbiddenException('Order does not belong to your organization');
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

  async payOrder(merchantOrgId: string, orderId: string) {
    // Verify org is MERCHANT
    const org = await this.prisma.org.findUnique({
      where: { id: merchantOrgId },
      select: { type: true },
    });

    if (!org || org.type !== OrgType.MERCHANT) {
      throw new ForbiddenException('Only MERCHANT orgs can pay orders');
    }

    // Get order with items
    const order = await this.prisma.marketplaceOrder.findFirst({
      where: {
        id: orderId,
        merchantOrgId,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if already paid
    if (order.paymentStatus === OrderPaymentStatus.PAID) {
      throw new BadRequestException('Order is already paid');
    }

    // Calculate total cost (sum of items)
    const totalCostCents = order.items.reduce((sum, item) => sum + (item.priceCents * item.qty), 0);

    if (totalCostCents <= 0) {
      throw new BadRequestException('Order total must be greater than zero');
    }

    // Debit from wallet and update order status in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Debit wallet (this will throw if insufficient balance)
      await this.financeService.debitForOrder(
        merchantOrgId,
        orderId,
        totalCostCents,
        `Pagamento do pedido ${order.externalOrderId}`,
      );

      // Update order payment status
      const updatedOrder = await tx.marketplaceOrder.update({
        where: { id: orderId },
        data: {
          paymentStatus: OrderPaymentStatus.PAID,
        },
        include: {
          items: {
            include: {
              listing: true,
            },
          },
          fulfillments: {
            include: {
              supplier: true,
            },
          },
        },
      });

      return updatedOrder;
    });

    return {
      id: result.id,
      provider: result.provider,
      externalOrderId: result.externalOrderId,
      status: result.status,
      paymentStatus: result.paymentStatus,
      buyerName: result.buyerName,
      shippingAddressJson: result.shippingAddressJson,
      totalCents: totalCostCents,
      createdAt: result.createdAt,
      items: result.items.map((item) => ({
        id: item.id,
        qty: item.qty,
        priceCents: item.priceCents,
        listing: item.listing,
      })),
      fulfillments: result.fulfillments.map((fulfillment) => ({
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
}
