import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/db/prisma.service';
import { FulfillmentStatus } from '@prisma/client';
import { ShipFulfillmentDto } from './dto/ship-fulfillment.dto';

@Injectable()
export class FulfillmentsService {
  constructor(private prisma: PrismaService) {}

  async getFulfillments(supplierOrgId: string) {
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

  async confirmFulfillment(fulfillmentId: string, supplierOrgId: string) {
    const fulfillment = await this.prisma.fulfillmentOrder.findUnique({
      where: { id: fulfillmentId },
    });

    if (!fulfillment) {
      throw new NotFoundException('Fulfillment not found');
    }

    if (fulfillment.supplierOrgId !== supplierOrgId) {
      throw new ForbiddenException('Fulfillment does not belong to this org');
    }

    if (fulfillment.status !== FulfillmentStatus.NEW) {
      throw new BadRequestException('Fulfillment can only be confirmed when status is NEW');
    }

    return this.prisma.fulfillmentOrder.update({
      where: { id: fulfillmentId },
      data: {
        status: FulfillmentStatus.CONFIRMED,
      },
      include: {
        order: true,
      },
    });
  }

  async shipFulfillment(fulfillmentId: string, supplierOrgId: string, dto: ShipFulfillmentDto) {
    const fulfillment = await this.prisma.fulfillmentOrder.findUnique({
      where: { id: fulfillmentId },
      include: {
        order: true,
      },
    });

    if (!fulfillment) {
      throw new NotFoundException('Fulfillment not found');
    }

    if (fulfillment.supplierOrgId !== supplierOrgId) {
      throw new ForbiddenException('Fulfillment does not belong to this org');
    }

    if (fulfillment.status !== FulfillmentStatus.CONFIRMED) {
      throw new BadRequestException('Fulfillment must be confirmed before shipping');
    }

    const updated = await this.prisma.fulfillmentOrder.update({
      where: { id: fulfillmentId },
      data: {
        status: FulfillmentStatus.SHIPPED,
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
}
