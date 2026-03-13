import { PrismaService } from '../../common/db/prisma.service';
export declare class StockReservationsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createReservation(supplierOfferId: string, qty: number, marketplaceOrderId?: string, expiryMinutes?: number): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.ReservationStatus;
        supplierOfferId: string;
        qty: number;
        marketplaceOrderId: string | null;
        expiresAt: Date;
    }>;
    consumeReservation(reservationId: string): Promise<{
        supplierOffer: {
            id: string;
            createdAt: Date;
            supplierOrgId: string;
            costCents: number;
            msrpCents: number | null;
            stockQty: number;
            slaDays: number;
            shipsFrom: string | null;
            allowRandomColor: boolean;
            skuId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.ReservationStatus;
        supplierOfferId: string;
        qty: number;
        marketplaceOrderId: string | null;
        expiresAt: Date;
    }>;
    releaseReservation(reservationId: string): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.ReservationStatus;
        supplierOfferId: string;
        qty: number;
        marketplaceOrderId: string | null;
        expiresAt: Date;
    }>;
    releaseExpiredReservations(): Promise<number>;
}
