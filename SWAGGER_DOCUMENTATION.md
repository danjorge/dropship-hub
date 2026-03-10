# Swagger/OpenAPI Documentation

## 🎯 Overview

The Dropship Hub API now includes **comprehensive Swagger/OpenAPI documentation** for all endpoints. The interactive API documentation is available at:

**Swagger UI:** http://localhost:3000/api

## ✨ Features Implemented

### 1. **Global Configuration**
- ✅ API title, description, and version
- ✅ Bearer JWT authentication scheme
- ✅ API Key authentication for `x-org-id` header
- ✅ Persistent authorization (tokens saved in browser)
- ✅ Organized by tags (Auth, Catalog, Listings, Fulfillments, Webhooks, Debug)

### 2. **All DTOs Documented**
Every DTO includes `@ApiProperty` decorators with:
- ✅ Field descriptions
- ✅ Example values
- ✅ Validation constraints (min, max, required/optional)
- ✅ Enum values where applicable

**DTOs with Swagger decorators:**
- `LoginDto` - Login credentials
- `CreateProductDto` - Product creation
- `CreateSkuDto` - SKU variant creation
- `CreateProductImageDto` - Product image
- `CreateOfferDto` - Supplier offer
- `CreateListingDto` - Marketplace listing
- `ShipFulfillmentDto` - Shipment tracking

### 3. **All Endpoints Documented**
Every endpoint includes:
- ✅ `@ApiOperation` - Summary and detailed description
- ✅ `@ApiResponse` - All possible HTTP status codes with descriptions
- ✅ `@ApiParam` - Path parameter descriptions
- ✅ `@ApiBearerAuth` - JWT authentication requirement
- ✅ `@ApiSecurity` - x-org-id header requirement
- ✅ `@ApiTags` - Endpoint grouping

## 📚 Endpoint Categories

### Auth (3 endpoints)
- `POST /auth/login` - User authentication
- `GET /auth/me` - Current user (JWT only)
- `GET /auth/me-in-org` - User with org validation (JWT + x-org-id)

### Catalog (7 endpoints)
**Supplier operations:**
- `POST /catalog/products` - Create product
- `GET /catalog/products` - List products
- `POST /catalog/products/:productId/skus` - Add SKU
- `POST /catalog/products/:productId/images` - Add image
- `POST /catalog/offers` - Create offer

**Merchant operations:**
- `GET /catalog/suppliers` - List approved suppliers
- `GET /catalog/suppliers/:supplierOrgId/products` - Browse supplier catalog

### Listings (2 endpoints)
- `POST /listings` - Create listing from supplier offer
- `GET /listings` - List merchant listings

### Fulfillments (3 endpoints)
- `GET /fulfillments` - List fulfillment orders
- `POST /fulfillments/:id/confirm` - Confirm fulfillment
- `POST /fulfillments/:id/ship` - Ship with tracking

### Webhooks (1 endpoint)
- `POST /integrations/shopee/webhook` - Shopee webhook handler

### Debug (2 endpoints)
- `GET /debug/me-orgs` - User's organizations
- `GET /debug/health/db` - Database health check

## 🔐 Authentication in Swagger UI

### Step 1: Login and Get Token
1. Open Swagger UI: http://localhost:3000/api
2. Expand **Auth** → **POST /auth/login**
3. Click "Try it out"
4. Use default credentials:
   ```json
   {
     "email": "admin@dropship.local",
     "password": "admin123"
   }
   ```
5. Click "Execute"
6. Copy the `accessToken` from the response

### Step 2: Authorize with JWT
1. Click the **"Authorize"** button (lock icon) at the top right
2. In the **JWT-auth** section, paste your token:
   ```
   <your-access-token-here>
   ```
3. Click "Authorize"
4. Click "Close"

### Step 3: Add Organization ID (for multi-tenant endpoints)
1. Click the **"Authorize"** button again
2. In the **x-org-id** section, enter an org ID:
   - Supplier: `00000000-0000-0000-0000-000000000001`
   - Merchant: `00000000-0000-0000-0000-000000000002`
3. Click "Authorize"
4. Click "Close"

Now you can test all protected endpoints directly from the Swagger UI!

## 📝 Example: Testing a Complete Flow in Swagger

### 1. Login
**Auth → POST /auth/login**
```json
{
  "email": "admin@dropship.local",
  "password": "admin123"
}
```
→ Copy `accessToken`

### 2. Authorize
Click "Authorize" → Paste token → Add org ID

### 3. Create Product (as Supplier)
**Catalog → POST /catalog/products**
- Authorize with Supplier org: `00000000-0000-0000-0000-000000000001`
```json
{
  "title": "Premium Wireless Headphones",
  "description": "High-quality noise-canceling headphones",
  "brand": "AudioTech",
  "isActive": true
}
```
→ Copy product `id`

### 4. Add SKU
**Catalog → POST /catalog/products/{productId}/skus**
```json
{
  "skuCode": "HEADPHONE-BLACK-001",
  "variantJson": {
    "color": "Black",
    "size": "Standard"
  },
  "weightGrams": 250
}
```
→ Copy SKU `id`

### 5. Create Offer
**Catalog → POST /catalog/offers**
```json
{
  "skuId": "<sku-id-from-step-4>",
  "costCents": 5000,
  "msrpCents": 12000,
  "stockQty": 100,
  "slaDays": 3,
  "shipsFrom": "São Paulo, SP"
}
```
→ Copy offer `id`

### 6. Browse as Merchant
**Catalog → GET /catalog/suppliers**
- Change authorization to Merchant org: `00000000-0000-0000-0000-000000000002`
- View approved suppliers

### 7. Create Listing
**Listings → POST /listings**
```json
{
  "supplierOfferId": "<offer-id-from-step-5>",
  "provider": "SHOPEE",
  "title": "Fone de Ouvido Premium Sem Fio",
  "priceCents": 15000
}
```

## 🎨 Swagger UI Features

### Interactive Testing
- ✅ Try out any endpoint directly from the browser
- ✅ See request/response examples
- ✅ View all possible status codes
- ✅ Automatic request body validation

### Schema Exploration
- ✅ View all DTOs and their properties
- ✅ See validation rules (required, min/max, patterns)
- ✅ Explore nested objects and arrays
- ✅ Enum values displayed

### Authentication
- ✅ Persistent JWT token (saved in browser)
- ✅ Persistent x-org-id header
- ✅ Easy switching between organizations
- ✅ Visual indication of protected endpoints (lock icons)

## 📦 Technical Implementation

### Main Configuration (`src/main.ts`)
```typescript
const config = new DocumentBuilder()
  .setTitle('Dropship Hub API')
  .setDescription('Multi-tenant SaaS backend for dropshipping')
  .setVersion('1.0')
  .addBearerAuth({
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  }, 'JWT-auth')
  .addApiKey({
    type: 'apiKey',
    name: 'x-org-id',
    in: 'header',
  }, 'x-org-id')
  .addTag('Auth', 'Authentication endpoints')
  // ... more tags
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document, {
  swaggerOptions: {
    persistAuthorization: true,
  },
});
```

### Controller Decorators
```typescript
@ApiTags('Catalog')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('x-org-id')
@Controller('catalog')
export class CatalogController {
  
  @Post('products')
  @ApiOperation({ 
    summary: 'Create product',
    description: 'Create a new product (SUPPLIER org only)'
  })
  @ApiResponse({ status: 201, description: 'Product created' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  createProduct(@Body() dto: CreateProductDto) {
    // ...
  }
}
```

### DTO Decorators
```typescript
export class CreateProductDto {
  @ApiProperty({
    description: 'Product title',
    example: 'Premium Wireless Headphones',
  })
  @IsString()
  title!: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'High-quality noise-canceling headphones',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
```

## 🚀 Accessing Swagger

### Development
```bash
# Start the application
pnpm run start:dev

# Open Swagger UI in browser
open http://localhost:3000/api
```

### OpenAPI JSON
The raw OpenAPI specification is available at:
- **JSON:** http://localhost:3000/api-json
- **YAML:** http://localhost:3000/api-yaml (if configured)

### Export Documentation
```bash
# Download OpenAPI spec
curl http://localhost:3000/api-json > openapi.json

# Use with other tools (Postman, Insomnia, etc.)
```

## 📊 Documentation Coverage

| Category | Endpoints | DTOs | Status |
|----------|-----------|------|--------|
| Auth | 3 | 1 | ✅ Complete |
| Catalog | 7 | 4 | ✅ Complete |
| Listings | 2 | 1 | ✅ Complete |
| Fulfillments | 3 | 1 | ✅ Complete |
| Webhooks | 1 | 0 | ✅ Complete |
| Debug | 2 | 0 | ✅ Complete |
| **Total** | **18** | **7** | **✅ 100%** |

## 🎯 Benefits

### For Developers
- ✅ Interactive API testing without writing curl commands
- ✅ Automatic request/response validation
- ✅ Clear documentation of all endpoints
- ✅ Easy onboarding for new team members

### For Frontend Teams
- ✅ Self-service API exploration
- ✅ Up-to-date API contracts
- ✅ Example requests and responses
- ✅ Type definitions can be generated from OpenAPI spec

### For QA/Testing
- ✅ Manual testing without Postman
- ✅ Verify all status codes
- ✅ Test authentication flows
- ✅ Validate multi-tenant behavior

## 🔧 Customization Options

### Adding More Tags
```typescript
.addTag('Orders', 'Order management')
.addTag('Analytics', 'Reporting and analytics')
```

### Custom Response Types
```typescript
@ApiResponse({
  status: 200,
  description: 'Product retrieved',
  type: ProductResponseDto,
})
```

### File Upload Documentation
```typescript
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
      },
    },
  },
})
```

## 📚 Additional Resources

- **NestJS Swagger Documentation:** https://docs.nestjs.com/openapi/introduction
- **OpenAPI Specification:** https://swagger.io/specification/
- **Swagger UI:** https://swagger.io/tools/swagger-ui/

## ✅ Summary

Your Dropship Hub API now has **complete Swagger/OpenAPI documentation** covering:
- ✅ All 18 endpoints across 6 categories
- ✅ All 7 DTOs with detailed property descriptions
- ✅ JWT and x-org-id authentication
- ✅ Interactive testing interface
- ✅ Comprehensive examples and status codes

**Access it now at:** http://localhost:3000/api 🚀
