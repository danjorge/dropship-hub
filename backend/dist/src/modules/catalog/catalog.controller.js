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
exports.CatalogController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const catalog_service_1 = require("./catalog.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const org_guard_1 = require("../auth/guards/org.guard");
const org_id_decorator_1 = require("../auth/decorators/org-id.decorator");
const create_product_dto_1 = require("./dto/create-product.dto");
const create_sku_dto_1 = require("./dto/create-sku.dto");
const create_product_image_dto_1 = require("./dto/create-product-image.dto");
const create_offer_dto_1 = require("./dto/create-offer.dto");
let CatalogController = class CatalogController {
    constructor(catalogService) {
        this.catalogService = catalogService;
    }
    createProduct(orgId, dto) {
        return this.catalogService.createProduct(orgId, dto);
    }
    getProducts(orgId) {
        return this.catalogService.getProducts(orgId);
    }
    createSku(productId, orgId, dto) {
        return this.catalogService.createSku(productId, orgId, dto);
    }
    createProductImage(productId, orgId, dto) {
        return this.catalogService.createProductImage(productId, orgId, dto);
    }
    createOffer(orgId, dto) {
        return this.catalogService.createOffer(orgId, dto);
    }
    getSuppliers(orgId) {
        return this.catalogService.getSuppliers(orgId);
    }
    getSupplierProducts(orgId, supplierOrgId) {
        return this.catalogService.getSupplierProducts(orgId, supplierOrgId);
    }
};
exports.CatalogController = CatalogController;
__decorate([
    (0, common_1.Post)('products'),
    (0, swagger_1.ApiOperation)({ summary: 'Create product', description: 'Create a new product (SUPPLIER org only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Product created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - only SUPPLIER orgs can create products' }),
    __param(0, (0, org_id_decorator_1.OrgId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_product_dto_1.CreateProductDto]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Get)('products'),
    (0, swagger_1.ApiOperation)({ summary: 'Get products', description: 'List all products for the supplier organization' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Products retrieved successfully' }),
    __param(0, (0, org_id_decorator_1.OrgId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Post)('products/:productId/skus'),
    (0, swagger_1.ApiOperation)({ summary: 'Create SKU', description: 'Add a SKU variant to a product' }),
    (0, swagger_1.ApiParam)({ name: 'productId', description: 'Product ID' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'SKU created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Product not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - product does not belong to this org' }),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, org_id_decorator_1.OrgId)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_sku_dto_1.CreateSkuDto]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "createSku", null);
__decorate([
    (0, common_1.Post)('products/:productId/images'),
    (0, swagger_1.ApiOperation)({ summary: 'Add product image', description: 'Add an image to a product' }),
    (0, swagger_1.ApiParam)({ name: 'productId', description: 'Product ID' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Image added successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Product not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - product does not belong to this org' }),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, org_id_decorator_1.OrgId)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_product_image_dto_1.CreateProductImageDto]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "createProductImage", null);
__decorate([
    (0, common_1.Post)('offers'),
    (0, swagger_1.ApiOperation)({ summary: 'Create supplier offer', description: 'Create a supplier offer with pricing and stock (SUPPLIER org only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Offer created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - only SUPPLIER orgs can create offers' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'SKU not found' }),
    __param(0, (0, org_id_decorator_1.OrgId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_offer_dto_1.CreateOfferDto]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "createOffer", null);
__decorate([
    (0, common_1.Get)('suppliers'),
    (0, swagger_1.ApiOperation)({ summary: 'Get approved suppliers', description: 'List all approved suppliers for the merchant organization' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Suppliers retrieved successfully' }),
    __param(0, (0, org_id_decorator_1.OrgId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "getSuppliers", null);
__decorate([
    (0, common_1.Get)('suppliers/:supplierOrgId/products'),
    (0, swagger_1.ApiOperation)({ summary: 'Get supplier products', description: 'Browse products from an approved supplier' }),
    (0, swagger_1.ApiParam)({ name: 'supplierOrgId', description: 'Supplier organization ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Products retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - no approved relationship with this supplier' }),
    __param(0, (0, org_id_decorator_1.OrgId)()),
    __param(1, (0, common_1.Param)('supplierOrgId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "getSupplierProducts", null);
exports.CatalogController = CatalogController = __decorate([
    (0, swagger_1.ApiTags)('Catalog'),
    (0, common_1.Controller)('catalog'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, org_guard_1.OrgGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiSecurity)('x-org-id'),
    __metadata("design:paramtypes", [catalog_service_1.CatalogService])
], CatalogController);
//# sourceMappingURL=catalog.controller.js.map