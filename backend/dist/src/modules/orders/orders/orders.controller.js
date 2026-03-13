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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const orders_service_1 = require("./orders.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const org_guard_1 = require("../../auth/guards/org.guard");
const org_id_decorator_1 = require("../../auth/decorators/org-id.decorator");
const get_orders_dto_1 = require("../dto/get-orders.dto");
let OrdersController = class OrdersController {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    getOrders(orgId, filters) {
        return this.ordersService.getOrders(orgId, filters);
    }
    getOrderById(orgId, orderId) {
        return this.ordersService.getOrderById(orgId, orderId);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get orders',
        description: 'List marketplace orders filtered by connected integrations. Only shows orders for providers with ACTIVE integrations. Supports filtering, search, and pagination.',
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - provider filter not connected' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - only MERCHANT orgs can access orders' }),
    __param(0, (0, org_id_decorator_1.OrgId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, get_orders_dto_1.GetOrdersDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get order details',
        description: 'Get full details of a specific marketplace order including items, fulfillments, and shipping information.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Order ID (UUID)',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Order details retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - order does not belong to your organization' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }),
    __param(0, (0, org_id_decorator_1.OrgId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "getOrderById", null);
exports.OrdersController = OrdersController = __decorate([
    (0, swagger_1.ApiTags)('Orders'),
    (0, common_1.Controller)('orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, org_guard_1.OrgGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiSecurity)('x-org-id'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map