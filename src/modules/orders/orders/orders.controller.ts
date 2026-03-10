import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity, ApiParam } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OrgGuard } from '../../auth/guards/org.guard';
import { OrgId } from '../../auth/decorators/org-id.decorator';
import { GetOrdersDto } from '../dto/get-orders.dto';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, OrgGuard)
@ApiBearerAuth('JWT-auth')
@ApiSecurity('x-org-id')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({
    summary: 'Get orders',
    description: 'List marketplace orders filtered by connected integrations. Only shows orders for providers with ACTIVE integrations. Supports filtering, search, and pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully. Returns available providers, paginated items, and total count.',
    schema: {
      type: 'object',
      properties: {
        providers: {
          type: 'array',
          items: { type: 'string', enum: ['SHOPEE', 'MERCADOLIVRE'] },
          description: 'Available providers (connected integrations)',
        },
        items: {
          type: 'array',
          description: 'Paginated orders',
        },
        page: {
          type: 'number',
          description: 'Current page number',
        },
        pageSize: {
          type: 'number',
          description: 'Items per page',
        },
        total: {
          type: 'number',
          description: 'Total count of orders matching filters',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - provider filter not connected' })
  @ApiResponse({ status: 403, description: 'Forbidden - only MERCHANT orgs can access orders' })
  getOrders(@OrgId() orgId: string, @Query() filters: GetOrdersDto) {
    return this.ordersService.getOrders(orgId, filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get order details',
    description: 'Get full details of a specific marketplace order including items, fulfillments, and shipping information.',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Order details retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - order does not belong to your organization' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  getOrderById(@OrgId() orgId: string, @Param('id') orderId: string) {
    return this.ordersService.getOrderById(orgId, orderId);
  }
}
