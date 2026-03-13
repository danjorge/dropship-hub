import { FulfillmentsService } from './fulfillments.service';
import { ShipFulfillmentDto } from './dto/ship-fulfillment.dto';
export declare class FulfillmentsController {
    private readonly fulfillmentsService;
    constructor(fulfillmentsService: FulfillmentsService);
    getFulfillments(orgId: string): Promise<({
        merchant: {
            id: string;
            name: string;
            type: import("@prisma/client").$Enums.OrgType;
            createdAt: Date;
        };
        order: {
            items: {
                id: string;
                priceCents: number;
                supplierOfferId: string | null;
                qty: number;
                marketplaceOrderId: string;
                listingId: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            provider: import("@prisma/client").$Enums.Provider;
            status: string;
            merchantOrgId: string;
            externalOrderId: string;
            buyerName: string | null;
            shippingAddressJson: import("@prisma/client/runtime/library").JsonValue | null;
            totalCents: number | null;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.FulfillmentStatus;
        supplierOrgId: string;
        merchantOrgId: string;
        marketplaceOrderId: string;
        trackingCode: string | null;
        carrier: string | null;
        shippedAt: Date | null;
    })[]>;
    confirmFulfillment(id: string, orgId: string): Promise<{
        order: {
            id: string;
            createdAt: Date;
            provider: import("@prisma/client").$Enums.Provider;
            status: string;
            merchantOrgId: string;
            externalOrderId: string;
            buyerName: string | null;
            shippingAddressJson: import("@prisma/client/runtime/library").JsonValue | null;
            totalCents: number | null;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.FulfillmentStatus;
        supplierOrgId: string;
        merchantOrgId: string;
        marketplaceOrderId: string;
        trackingCode: string | null;
        carrier: string | null;
        shippedAt: Date | null;
    }>;
    shipFulfillment(id: string, orgId: string, dto: ShipFulfillmentDto): Promise<{
        order: {
            id: string;
            createdAt: Date;
            provider: import("@prisma/client").$Enums.Provider;
            status: string;
            merchantOrgId: string;
            externalOrderId: string;
            buyerName: string | null;
            shippingAddressJson: import("@prisma/client/runtime/library").JsonValue | null;
            totalCents: number | null;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.FulfillmentStatus;
        supplierOrgId: string;
        merchantOrgId: string;
        marketplaceOrderId: string;
        trackingCode: string | null;
        carrier: string | null;
        shippedAt: Date | null;
    }>;
}
