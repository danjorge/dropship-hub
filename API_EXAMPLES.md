# Dropship Hub API Examples

## Authentication

### 1. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dropship.local",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "eb189a72-fde3-4732-8bf8-b44fe611802e",
    "email": "admin@dropship.local",
    "fullName": "Admin"
  }
}
```

### 2. Get Current User (JWT only)
```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Get User in Org Context (JWT + OrgGuard)
```bash
export SUPPLIER_ORG="00000000-0000-0000-0000-000000000001"

curl -X GET http://localhost:3000/auth/me-in-org \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-org-id: $SUPPLIER_ORG"
```

## Debug Endpoints

### 4. Get User's Organizations
```bash
curl -X GET http://localhost:3000/debug/me-orgs \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "userId": "eb189a72-fde3-4732-8bf8-b44fe611802e",
  "orgs": [
    {
      "orgId": "00000000-0000-0000-0000-000000000001",
      "name": "Supplier Demo",
      "type": "SUPPLIER",
      "role": "OWNER"
    },
    {
      "orgId": "00000000-0000-0000-0000-000000000002",
      "name": "Merchant Demo",
      "type": "MERCHANT",
      "role": "OWNER"
    }
  ]
}
```

### 5. Database Health Check
```bash
curl -X GET http://localhost:3000/debug/health/db \
  -H "Authorization: Bearer $TOKEN"
```

## Catalog (Supplier Side)

### 6. Create Product
```bash
export SUPPLIER_ORG="00000000-0000-0000-0000-000000000001"

curl -X POST http://localhost:3000/catalog/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-org-id: $SUPPLIER_ORG" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Premium Wireless Headphones",
    "description": "High-quality noise-canceling headphones",
    "brand": "AudioTech",
    "isActive": true
  }'
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "supplierOrgId": "00000000-0000-0000-0000-000000000001",
  "title": "Premium Wireless Headphones",
  "description": "High-quality noise-canceling headphones",
  "brand": "AudioTech",
  "isActive": true,
  "createdAt": "2026-03-05T22:00:00.000Z",
  "skus": [],
  "images": []
}
```

### 7. Get Supplier Products
```bash
curl -X GET http://localhost:3000/catalog/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-org-id: $SUPPLIER_ORG"
```

### 8. Create SKU for Product
```bash
export PRODUCT_ID="550e8400-e29b-41d4-a716-446655440000"

curl -X POST http://localhost:3000/catalog/products/$PRODUCT_ID/skus \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-org-id: $SUPPLIER_ORG" \
  -H "Content-Type: application/json" \
  -d '{
    "skuCode": "HEADPHONE-BLACK-001",
    "variantJson": {
      "color": "Black",
      "size": "Standard"
    },
    "weightGrams": 250,
    "lengthCm": 20,
    "widthCm": 18,
    "heightCm": 8
  }'
```

### 9. Add Product Image
```bash
curl -X POST http://localhost:3000/catalog/products/$PRODUCT_ID/images \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-org-id: $SUPPLIER_ORG" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/images/headphone-main.jpg",
    "sortOrder": 0
  }'
```

### 10. Create Supplier Offer
```bash
export SKU_ID="660e8400-e29b-41d4-a716-446655440000"

curl -X POST http://localhost:3000/catalog/offers \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-org-id: $SUPPLIER_ORG" \
  -H "Content-Type: application/json" \
  -d '{
    "skuId": "'$SKU_ID'",
    "costCents": 5000,
    "msrpCents": 12000,
    "stockQty": 100,
    "slaDays": 3,
    "shipsFrom": "São Paulo, SP",
    "allowRandomColor": false
  }'
```

## Catalog (Merchant Side)

### 11. Get Approved Suppliers
```bash
export MERCHANT_ORG="00000000-0000-0000-0000-000000000002"

curl -X GET http://localhost:3000/catalog/suppliers \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-org-id: $MERCHANT_ORG"
```

### 12. Get Supplier's Products
```bash
curl -X GET http://localhost:3000/catalog/suppliers/$SUPPLIER_ORG/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-org-id: $MERCHANT_ORG"
```

## Listings (Merchant)

### 13. Create Listing from Supplier Offer
```bash
export OFFER_ID="770e8400-e29b-41d4-a716-446655440000"

curl -X POST http://localhost:3000/listings \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-org-id: $MERCHANT_ORG" \
  -H "Content-Type: application/json" \
  -d '{
    "supplierOfferId": "'$OFFER_ID'",
    "provider": "SHOPEE",
    "title": "Fone de Ouvido Premium Sem Fio",
    "priceCents": 15000
  }'
```

### 14. Get Merchant Listings
```bash
curl -X GET http://localhost:3000/listings \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-org-id: $MERCHANT_ORG"
```

## Webhooks (Shopee Integration)

### 15. Simulate Shopee Order Webhook
```bash
curl -X POST http://localhost:3000/integrations/shopee/webhook \
  -H "Content-Type: application/json" \
  -H "x-shopee-signature: placeholder-signature" \
  -d '{
    "event_id": "shopee_evt_12345",
    "event_type": "order_created",
    "order": {
      "order_id": "SHOPEE-ORDER-001",
      "merchant_org_id": "00000000-0000-0000-0000-000000000002",
      "status": "PENDING",
      "buyer_name": "João Silva",
      "shipping_address": {
        "street": "Rua das Flores, 123",
        "city": "São Paulo",
        "state": "SP",
        "zip": "01234-567"
      },
      "total_cents": 15000,
      "items": [
        {
          "listing_id": "880e8400-e29b-41d4-a716-446655440000",
          "qty": 1,
          "price_cents": 15000
        }
      ]
    }
  }'
```

**Response:**
```json
{
  "status": "processed"
}
```

## Fulfillments (Supplier)

### 16. Get Fulfillment Orders
```bash
curl -X GET http://localhost:3000/fulfillments \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-org-id: $SUPPLIER_ORG"
```

### 17. Confirm Fulfillment
```bash
export FULFILLMENT_ID="990e8400-e29b-41d4-a716-446655440000"

curl -X POST http://localhost:3000/fulfillments/$FULFILLMENT_ID/confirm \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-org-id: $SUPPLIER_ORG"
```

### 18. Ship Fulfillment
```bash
curl -X POST http://localhost:3000/fulfillments/$FULFILLMENT_ID/ship \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-org-id: $SUPPLIER_ORG" \
  -H "Content-Type: application/json" \
  -d '{
    "trackingCode": "BR123456789SP",
    "carrier": "Correios"
  }'
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
DATABASE_URL=postgresql://dropship:dropship@localhost:5433/dropship
JWT_SECRET=your-super-secret-jwt-key-change-in-production
REDIS_HOST=localhost
REDIS_PORT=6379
APP_ENC_KEY=your-32-char-encryption-key-here
PORT=3000
```

## Running the Application

1. **Start Docker services:**
   ```bash
   docker compose up -d
   ```

2. **Run database seed:**
   ```bash
   npx tsx prisma/seed.ts
   ```

3. **Start the application:**
   ```bash
   pnpm run start:dev
   ```

## Default Credentials

- **Email:** admin@dropship.local
- **Password:** admin123
- **Supplier Org ID:** 00000000-0000-0000-0000-000000000001
- **Merchant Org ID:** 00000000-0000-0000-0000-000000000002
