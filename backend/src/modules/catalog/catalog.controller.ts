import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity, ApiParam } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrgGuard } from '../auth/guards/org.guard';
import { OrgId } from '../auth/decorators/org-id.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateSkuDto } from './dto/create-sku.dto';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { CreateOfferDto } from './dto/create-offer.dto';

@ApiTags('Catalog')
@Controller('catalog')
@UseGuards(JwtAuthGuard, OrgGuard)
@ApiBearerAuth('JWT-auth')
@ApiSecurity('x-org-id')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post('products')
  @ApiOperation({ summary: 'Create product', description: 'Create a new product (SUPPLIER org only)' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - only SUPPLIER orgs can create products' })
  createProduct(@OrgId() orgId: string, @Body() dto: CreateProductDto) {
    return this.catalogService.createProduct(orgId, dto);
  }

  @Get('products')
  @ApiOperation({ summary: 'Get products', description: 'List all products for the supplier organization' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  getProducts(@OrgId() orgId: string) {
    return this.catalogService.getProducts(orgId);
  }

  @Post('products/:productId/skus')
  @ApiOperation({ summary: 'Create SKU', description: 'Add a SKU variant to a product' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({ status: 201, description: 'SKU created successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - product does not belong to this org' })
  createSku(
    @Param('productId') productId: string,
    @OrgId() orgId: string,
    @Body() dto: CreateSkuDto,
  ) {
    return this.catalogService.createSku(productId, orgId, dto);
  }

  @Post('products/:productId/images')
  @ApiOperation({ summary: 'Add product image', description: 'Add an image to a product' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({ status: 201, description: 'Image added successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - product does not belong to this org' })
  createProductImage(
    @Param('productId') productId: string,
    @OrgId() orgId: string,
    @Body() dto: CreateProductImageDto,
  ) {
    return this.catalogService.createProductImage(productId, orgId, dto);
  }

  @Post('offers')
  @ApiOperation({ summary: 'Create supplier offer', description: 'Create a supplier offer with pricing and stock (SUPPLIER org only)' })
  @ApiResponse({ status: 201, description: 'Offer created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - only SUPPLIER orgs can create offers' })
  @ApiResponse({ status: 404, description: 'SKU not found' })
  createOffer(@OrgId() orgId: string, @Body() dto: CreateOfferDto) {
    return this.catalogService.createOffer(orgId, dto);
  }

  @Get('suppliers')
  @ApiOperation({ summary: 'Get approved suppliers', description: 'List all approved suppliers for the merchant organization' })
  @ApiResponse({ status: 200, description: 'Suppliers retrieved successfully' })
  getSuppliers(@OrgId() orgId: string) {
    return this.catalogService.getSuppliers(orgId);
  }

  @Get('suppliers/:supplierOrgId/products')
  @ApiOperation({ summary: 'Get supplier products', description: 'Browse products from an approved supplier' })
  @ApiParam({ name: 'supplierOrgId', description: 'Supplier organization ID' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - no approved relationship with this supplier' })
  getSupplierProducts(
    @OrgId() orgId: string,
    @Param('supplierOrgId') supplierOrgId: string,
  ) {
    return this.catalogService.getSupplierProducts(orgId, supplierOrgId);
  }
}
