import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/db/prisma.service';
import { ReservationStatus } from '@prisma/client';

@Injectable()
export class StockReservationsService {
  private readonly logger = new Logger(StockReservationsService.name);

  constructor(private prisma: PrismaService) {}

  async createReservation(
    supplierOfferId: string,
    qty: number,
    marketplaceOrderId?: string,
    expiryMinutes = 15,
  ) {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);

    return this.prisma.stockReservation.create({
      data: {
        supplierOfferId,
        marketplaceOrderId,
        qty,
        status: ReservationStatus.HELD,
        expiresAt,
      },
    });
  }

  async consumeReservation(reservationId: string) {
    const reservation = await this.prisma.stockReservation.findUnique({
      where: { id: reservationId },
      include: { supplierOffer: true },
    });

    if (!reservation || reservation.status !== ReservationStatus.HELD) {
      return null;
    }

    await this.prisma.$transaction([
      this.prisma.stockReservation.update({
        where: { id: reservationId },
        data: { status: ReservationStatus.CONSUMED },
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

  async releaseReservation(reservationId: string) {
    return this.prisma.stockReservation.update({
      where: { id: reservationId },
      data: { status: ReservationStatus.RELEASED },
    });
  }

  async releaseExpiredReservations() {
    const expired = await this.prisma.stockReservation.findMany({
      where: {
        status: ReservationStatus.HELD,
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
}
