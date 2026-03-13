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
exports.ListingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const listings_service_1 = require("./listings.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const org_guard_1 = require("../auth/guards/org.guard");
const org_id_decorator_1 = require("../auth/decorators/org-id.decorator");
const create_listing_dto_1 = require("./dto/create-listing.dto");
const get_listings_dto_1 = require("./dto/get-listings.dto");
let ListingsController = class ListingsController {
    constructor(listingsService) {
        this.listingsService = listingsService;
    }
    createListing(orgId, dto) {
        return this.listingsService.createListing(orgId, dto);
    }
    getListings(orgId, filters) {
        return this.listingsService.getListings(orgId, filters);
    }
};
exports.ListingsController = ListingsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create listing',
        description: 'Create a marketplace listing from a supplier offer (MERCHANT org only). Provider must be connected and active.'
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Listing created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - provider not connected or not active' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - only MERCHANT orgs can create listings or no approved relationship with supplier' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Supplier offer not found' }),
    __param(0, (0, org_id_decorator_1.OrgId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_listing_dto_1.CreateListingDto]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "createListing", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get listings',
        description: 'List marketplace listings filtered by connected integrations. Only shows listings for providers with ACTIVE integrations. Supports filtering by provider, status, and search.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Listings retrieved successfully. Returns available providers and filtered items.',
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
                    description: 'Filtered listings',
                },
                total: {
                    type: 'number',
                    description: 'Total count of filtered listings',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - provider filter not connected' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - only MERCHANT orgs can access listings' }),
    __param(0, (0, org_id_decorator_1.OrgId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, get_listings_dto_1.GetListingsDto]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "getListings", null);
exports.ListingsController = ListingsController = __decorate([
    (0, swagger_1.ApiTags)('Listings'),
    (0, common_1.Controller)('listings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, org_guard_1.OrgGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiSecurity)('x-org-id'),
    __metadata("design:paramtypes", [listings_service_1.ListingsService])
], ListingsController);
//# sourceMappingURL=listings.controller.js.map