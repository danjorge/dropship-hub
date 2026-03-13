import { PrismaService } from '../../../common/db/prisma.service';
import { Provider } from '@prisma/client';
import { GetOrdersDto } from '../dto/get-orders.dto';
import { IntegrationsService } from '../../integrations/integrations.service';
export interface OrdersResponse {
    providers: Provider[];
    items: Array<{
        id: string;
        provider: Provider;
        externalOrderId: string;
        status: string;
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
export declare class OrdersService {
    private prisma;
    private integrationsService;
    constructor(prisma: PrismaService, integrationsService: IntegrationsService);
    getOrders(merchantOrgId: string, filters: GetOrdersDto): Promise<OrdersResponse>;
    getOrderById(merchantOrgId: string, orderId: string): Promise<OrderDetailsResponse>;
}
