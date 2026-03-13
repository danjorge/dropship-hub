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
exports.FulfillmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const fulfillments_service_1 = require("./fulfillments.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const org_guard_1 = require("../auth/guards/org.guard");
const org_id_decorator_1 = require("../auth/decorators/org-id.decorator");
const ship_fulfillment_dto_1 = require("./dto/ship-fulfillment.dto");
let FulfillmentsController = class FulfillmentsController {
    constructor(fulfillmentsService) {
        this.fulfillmentsService = fulfillmentsService;
    }
    getFulfillments(orgId) {
        return this.fulfillmentsService.getFulfillments(orgId);
    }
    confirmFulfillment(id, orgId) {
        return this.fulfillmentsService.confirmFulfillment(id, orgId);
    }
    shipFulfillment(id, orgId, dto) {
        return this.fulfillmentsService.shipFulfillment(id, orgId, dto);
    }
};
exports.FulfillmentsController = FulfillmentsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get fulfillments', description: 'List all fulfillment orders for the supplier organization' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fulfillments retrieved successfully' }),
    __param(0, (0, org_id_decorator_1.OrgId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FulfillmentsController.prototype, "getFulfillments", null);
__decorate([
    (0, common_1.Post)(':id/confirm'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm fulfillment', description: 'Confirm a fulfillment order (status: NEW → CONFIRMED)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Fulfillment order ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fulfillment confirmed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Fulfillment not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - fulfillment does not belong to this org' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - fulfillment can only be confirmed when status is NEW' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, org_id_decorator_1.OrgId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FulfillmentsController.prototype, "confirmFulfillment", null);
__decorate([
    (0, common_1.Post)(':id/ship'),
    (0, swagger_1.ApiOperation)({ summary: 'Ship fulfillment', description: 'Mark fulfillment as shipped with tracking info (status: CONFIRMED → SHIPPED)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Fulfillment order ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fulfillment shipped successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Fulfillment not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - fulfillment does not belong to this org' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - fulfillment must be confirmed before shipping' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, org_id_decorator_1.OrgId)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, ship_fulfillment_dto_1.ShipFulfillmentDto]),
    __metadata("design:returntype", void 0)
], FulfillmentsController.prototype, "shipFulfillment", null);
exports.FulfillmentsController = FulfillmentsController = __decorate([
    (0, swagger_1.ApiTags)('Fulfillments'),
    (0, common_1.Controller)('fulfillments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, org_guard_1.OrgGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiSecurity)('x-org-id'),
    __metadata("design:paramtypes", [fulfillments_service_1.FulfillmentsService])
], FulfillmentsController);
//# sourceMappingURL=fulfillments.controller.js.map