import { OrdersService } from './orders.service';
import { GetOrdersDto } from '../dto/get-orders.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    getOrders(orgId: string, filters: GetOrdersDto): Promise<import("./orders.service").OrdersResponse>;
    getOrderById(orgId: string, orderId: string): Promise<import("./orders.service").OrderDetailsResponse>;
}
