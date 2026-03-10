# Merchant Orders Flow - Implementation Summary

## Overview
Implemented a complete merchant orders management system with near-real-time monitoring, marketplace integration filtering, and comprehensive order tracking. Merchants can view orders from connected marketplaces with automatic 30-second refresh intervals.

---

## Backend Implementation

### 1. Orders Service (`src/modules/orders/orders/orders.service.ts`)

**Complete implementation with two main methods:**

#### `getOrders(merchantOrgId, filters)` - List Orders
**Business Logic:**
1. **Verify org is MERCHANT** - Only merchant orgs can access orders
2. **Get available providers** - Fetch active integrations from IntegrationsService
3. **Validate provider filter** - If provider filter specified, ensure it's connected
4. **Filter orders by connected providers** - Only show orders for active integrations
5. **Apply additional filters** - Search (order ID/buyer name), status, date range
6. **Pagination** - Calculate skip/take for efficient queries
7. **Optimize query** - Single query with includes, avoid N+1 problems
8. **Return structured response** with providers array, paginated items, and totals

**Response Structure:**
```typescript
{
  providers: Provider[];        // Available connected providers
  items: MarketplaceOrder[];   // Paginated orders with fulfillment summary
  page: number;                // Current page
  pageSize: number;            // Items per page
  total: number;               // Total count for pagination
}
```

**Key Features:**
- Returns empty if no integrations connected
- Includes fulfillment summary (most recent fulfillment per order)
- Counts items per order efficiently
- Sorts by `createdAt DESC` for latest orders first
- Production-ready pagination

#### `getOrderById(merchantOrgId, orderId)` - Order Details
**Returns:**
- Full order information
- All order items with listing details
- All fulfillments with supplier information
- Shipping address JSON
- Validates order belongs to merchant org

---

### 2. Orders Controller (`src/modules/orders/orders/orders.controller.ts`)

**Two endpoints:**

#### `GET /orders`
- Query params: `provider`, `status`, `search`, `from`, `to`, `page`, `pageSize`
- Requires JWT + OrgGuard
- Returns paginated orders with providers array
- Validates provider filter against connected integrations

#### `GET /orders/:id`
- Returns full order details
- Includes items, fulfillments, shipping info
- Validates ownership

**Security:**
- JWT authentication required
- OrgGuard validates x-org-id header
- Only MERCHANT orgs can access
- Orders scoped to merchant organization
- Provider filters validated against active integrations

---

### 3. GetOrdersDto (`src/modules/orders/dto/get-orders.dto.ts`)

**Query Parameters:**
```typescript
{
  provider?: Provider;      // Filter by marketplace
  status?: string;          // Filter by order status
  search?: string;          // Search order ID or buyer name
  from?: string;            // Date range start (ISO 8601)
  to?: string;              // Date range end (ISO 8601)
  page?: number;            // Page number (default: 1)
  pageSize?: number;        // Items per page (default: 20)
}
```

All fields optional with proper validation decorators.

---

### 4. Module Updates

**OrdersModule:**
- Added `PrismaModule` import for database access
- Added `IntegrationsModule` import to access IntegrationsService
- Exports OrdersService for use by other modules

---

### 5. Integration Filtering Architecture

**How it works:**
```typescript
// 1. Get active integrations
const availableProviders = await integrationsService.getAvailableProviders(orgId);
// Returns: ['SHOPEE', 'MERCADOLIVRE']

// 2. Filter orders by connected providers
where.provider = {
  in: availableProviders
};

// 3. If no integrations, return empty
if (availableProviders.length === 0) {
  return { providers: [], items: [], total: 0 };
}
```

**Benefits:**
- Automatic filtering by connected marketplaces
- Cannot see orders from disconnected providers
- Validates provider filters against active integrations
- Scalable for future providers

---

### 6. Performance Optimizations

**Query Optimization:**
- Single query with strategic `include` statements
- Counts items using select (not full load)
- Gets only most recent fulfillment per order (take: 1)
- Indexed sorting by `createdAt DESC`
- Pagination with skip/take

**Avoids N+1 Queries:**
```typescript
include: {
  items: { select: { id: true } },  // Count only
  fulfillments: {
    select: { status: true, trackingCode: true },
    orderBy: { createdAt: 'desc' },
    take: 1  // Most recent only
  }
}
```

---

## Frontend Implementation

### 1. Types (`web/src/types/index.ts`)

**New Types:**
```typescript
export interface MarketplaceOrder {
  id: string;
  provider: Provider;
  externalOrderId: string;
  status: string;
  buyerName: string | null;
  totalCents: number | null;
  createdAt: string;
  itemsCount: number;
  fulfillment: {
    status: string;
    trackingCode: string | null;
  } | null;
}

export interface OrdersResponse {
  providers: Provider[];
  items: MarketplaceOrder[];
  page: number;
  pageSize: number;
  total: number;
}

export interface GetOrdersParams {
  provider?: Provider;
  status?: string;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface OrderDetails {
  // Full order details with items and fulfillments
}
```

---

### 2. API Layer (`web/src/lib/api/orders.ts`)

**Two methods:**
```typescript
ordersApi.getOrders(params?)     // List orders with filters
ordersApi.getOrderById(orderId)  // Get order details
```

**Query String Building:**
- Builds URLSearchParams from filters
- Only includes non-empty parameters
- Automatically includes x-org-id via apiClient

---

### 3. Hooks (`web/src/hooks/useOrders.ts`)

**Two hooks:**

#### `useOrders(params, options)`
```typescript
const { data, isLoading, error, refetch, dataUpdatedAt } = useOrders(
  { provider, search, status, page, pageSize },
  { refetchInterval: 30000 }  // Auto-refresh every 30 seconds
);
```

**Features:**
- Automatic polling with `refetchInterval`
- Query key includes params for proper cache invalidation
- Returns `dataUpdatedAt` for "last updated" timestamp

#### `useOrder(orderId)`
```typescript
const { data: order, isLoading, error } = useOrder(orderId);
```

---

### 4. OrdersPage (`web/src/pages/orders/OrdersPage.tsx`)

**Complete implementation with:**

#### State Management:
- `selectedProvider` - Provider filter
- `searchQuery` - Search input
- `statusFilter` - Status filter
- `currentPage` - Pagination
- `lastUpdated` - Last refresh timestamp

#### Near-Real-Time Updates:
```typescript
const REFRESH_INTERVAL = 30000; // 30 seconds

useOrders(filters, { refetchInterval: REFRESH_INTERVAL });
```

**Features:**
- ✅ Auto-refresh every 30 seconds
- ✅ Manual refresh button
- ✅ "Last updated" timestamp display
- ✅ Optimistic UI (shows cached data while refreshing)

#### Three Main UI States:

1. **No Integrations Connected:**
   - Empty state with message
   - "Connect a marketplace to start receiving orders"
   - Button to navigate to /integrations

2. **No Orders Found:**
   - Context-aware empty states:
     - No orders for selected provider
     - No orders matching search
     - No orders yet (first time)

3. **Orders Table:**
   - Provider badge (color-coded)
   - Order ID
   - Buyer name
   - Items count
   - Total (formatted currency)
   - Order status badge (color-coded)
   - Fulfillment status badge with tracking code
   - Created at (formatted date/time)
   - View Details button

#### Filters Panel:
- **Provider filters** - Dynamic buttons for connected providers
- **Status dropdown** - PAID, PENDING, PROCESSING, SHIPPED, CANCELLED
- **Search input** - Real-time search by order ID or buyer name
- **Refresh button** - Manual refresh with timestamp

#### Pagination:
- Mobile-friendly (Previous/Next buttons)
- Desktop pagination (numbered pages with arrows)
- Shows "Showing X to Y of Z results"
- Smart page number display (shows 5 pages max)
- Resets to page 1 when filters change

#### Color Coding:
**Provider badges:**
- Shopee: Orange
- Mercado Livre: Yellow

**Order status badges:**
- Paid/Confirmed: Green
- Pending/Processing: Yellow
- Shipped/Delivered: Blue
- Cancelled/Failed: Red

**Fulfillment status badges:**
- SHIPPED: Blue
- CONFIRMED: Green
- NEW: Yellow
- CANCELLED: Red

---

### 5. OrderDetailsPage (`web/src/pages/orders/OrderDetailsPage.tsx`)

**Complete order details view with:**

#### Order Header:
- External order ID (large, prominent)
- Created at timestamp
- Provider badge
- Status badge

#### Buyer Information Section:
- Buyer name
- Shipping address (formatted JSON)

#### Order Items Table:
- Product name (from listing)
- Quantity
- Unit price
- Subtotal
- Total row at bottom

#### Fulfillments Section:
- All fulfillments for the order
- Status badge
- Supplier name
- Tracking code (if available)
- Carrier (if available)
- Shipped at timestamp (if shipped)
- Created at timestamp

#### Empty States:
- No fulfillments yet
- "Fulfillments will be created when suppliers process this order"

#### Navigation:
- "Back to Orders" button
- Breadcrumb-style navigation

---

### 6. Translations

**Added to all locales (en, pt, es):**

**Core keys:**
- `orders.title` - "Orders" / "Pedidos"
- `orders.subtitle` - "Monitor your marketplace orders in real-time"
- `orders.provider`, `orders.buyer`, `orders.orderId`
- `orders.orderStatus`, `orders.fulfillmentStatus`
- `orders.filterByProvider`, `orders.filterByStatus`
- `orders.search`, `orders.searchPlaceholder`
- `orders.refresh`, `orders.lastUpdated`

**Empty states:**
- `orders.noIntegrations` - No marketplace integrations connected
- `orders.connectMarketplace` - Connect a marketplace to start receiving orders
- `orders.noOrdersFound` - No orders found
- `orders.noOrdersForProvider` - No orders found for {{provider}}
- `orders.noOrdersMatchingSearch` - No orders matching your search

**Order details:**
- `orders.orderDetails`, `orders.backToOrders`
- `orders.buyerInfo`, `orders.shippingAddress`
- `orders.orderItems`, `orders.fulfillments`
- `orders.product`, `orders.quantity`, `orders.unitPrice`, `orders.subtotal`
- `orders.supplier`, `orders.trackingCode`, `orders.carrier`, `orders.shippedAt`

**Pagination:**
- `orders.showing`, `orders.to`, `orders.of`, `orders.results`
- `orders.previous`, `orders.next`

---

## How It Works

### Flow Diagram:

```
1. Merchant navigates to /orders
   ↓
2. Frontend calls GET /orders (with x-org-id header)
   ↓
3. Backend validates:
   - User is authenticated (JWT)
   - Org exists and user is member (OrgGuard)
   - Org type is MERCHANT
   ↓
4. Backend fetches active integrations for org
   ↓
5. Backend filters orders:
   - Only orders with provider IN active integrations
   - Apply additional filters (provider, search, status, dates)
   - Paginate results
   ↓
6. Backend returns:
   {
     providers: ['SHOPEE', 'MERCADOLIVRE'],
     items: [...orders with fulfillment summary...],
     page: 1,
     pageSize: 20,
     total: 53
   }
   ↓
7. Frontend displays:
   - If providers.length === 0: Show "connect marketplace" message
   - Else: Show filters + orders table + pagination
   ↓
8. Auto-refresh every 30 seconds (near-real-time)
   - TanStack Query refetchInterval
   - Updates "last updated" timestamp
   - Shows cached data while refreshing (no loading spinner)
```

---

## Near-Real-Time Architecture

### Current Implementation: Polling

**Frontend:**
```typescript
const REFRESH_INTERVAL = 30000; // 30 seconds

useOrders(filters, { refetchInterval: REFRESH_INTERVAL });
```

**Benefits:**
- ✅ Simple to implement
- ✅ Works with existing REST API
- ✅ No additional infrastructure needed
- ✅ Reliable and predictable
- ✅ TanStack Query handles caching and deduplication

**User Experience:**
- Data refreshes every 30 seconds automatically
- Manual refresh button available
- "Last updated" timestamp shows freshness
- No loading spinner during auto-refresh (shows cached data)
- Optimistic UI - feels instant

### Future Enhancement: WebSockets/SSE

**For true real-time updates, implement:**

1. **WebSocket Server (NestJS):**
```typescript
@WebSocketGateway()
export class OrdersGateway {
  @SubscribeMessage('subscribeToOrders')
  handleSubscribe(client: Socket, orgId: string) {
    client.join(`orders:${orgId}`);
  }
}
```

2. **Emit on Order Changes:**
```typescript
// In webhook handler or order creation
this.ordersGateway.server
  .to(`orders:${merchantOrgId}`)
  .emit('orderCreated', order);
```

3. **Frontend WebSocket Client:**
```typescript
const socket = io('http://localhost:3000');
socket.emit('subscribeToOrders', orgId);
socket.on('orderCreated', (order) => {
  queryClient.invalidateQueries(['orders']);
});
```

**Current architecture is ready for this upgrade** - just add WebSocket layer on top.

---

## Integration Filtering Logic

### Backend:
```typescript
// Get connected providers
const availableProviders = await integrationsService.getAvailableProviders(orgId);
// Returns: ['SHOPEE', 'MERCADOLIVRE'] if both connected

// If no integrations, return empty
if (availableProviders.length === 0) {
  return { providers: [], items: [], total: 0 };
}

// Filter orders by connected providers
where.provider = {
  in: availableProviders
};

// If specific provider requested, validate it's connected
if (filters.provider && !availableProviders.includes(filters.provider)) {
  throw new BadRequestException('Provider not connected');
}
```

### Frontend:
```typescript
// Provider filter buttons generated from response.providers
{providers.map((provider) => (
  <button onClick={() => setSelectedProvider(provider)}>
    {provider}
  </button>
))}

// When provider selected, new API call with filter
useOrders({ provider: selectedProvider })
```

**Result:** Merchants can only see orders from connected marketplaces.

---

## Security & Validation

### Backend Validation:
1. ✅ JWT authentication required
2. ✅ OrgGuard validates x-org-id header
3. ✅ Only MERCHANT orgs can access orders
4. ✅ Orders automatically scoped to merchant organization
5. ✅ Provider filter must be in connected integrations
6. ✅ Cannot access orders from other organizations
7. ✅ Date range validation (ISO 8601)
8. ✅ Pagination bounds validation

### Frontend Validation:
1. ✅ Provider filters only show connected marketplaces
2. ✅ Cannot select provider that's not connected
3. ✅ Empty state if no integrations
4. ✅ All API calls include x-org-id header automatically
5. ✅ Error handling for failed requests

---

## Database Schema

**No schema changes required!** Uses existing tables:
- `marketplace_orders` - Stores orders from marketplaces
- `marketplace_order_items` - Order line items
- `fulfillment_orders` - Fulfillment tracking
- `integrations` - Marketplace connections

**Key Fields Used:**
- `marketplace_orders.merchantOrgId` - Scopes orders to merchant
- `marketplace_orders.provider` - Must match integration provider
- `marketplace_orders.externalOrderId` - Marketplace order ID
- `marketplace_orders.status` - Order status from marketplace
- `marketplace_orders.buyerName` - Customer name
- `marketplace_orders.totalCents` - Order total
- `marketplace_orders.createdAt` - Order creation timestamp (indexed)
- `integrations.status` - Must be 'ACTIVE'

**Indexes:**
- `marketplace_orders.createdAt` - For sorting latest first
- `marketplace_orders.merchantOrgId` - For org filtering
- `marketplace_orders.provider` - For provider filtering
- Unique constraint: `(merchantOrgId, provider, externalOrderId)`

---

## Webhook Integration (Future)

### Architecture for Order Ingestion:

**Webhook Handler:**
```typescript
@Post('webhooks/:provider')
async handleWebhook(@Param('provider') provider: Provider, @Body() payload: any) {
  // 1. Store webhook event (idempotency)
  await this.prisma.webhookEvent.upsert({
    where: {
      provider_externalEventId: {
        provider,
        externalEventId: payload.event_id
      }
    },
    create: { provider, externalEventId: payload.event_id, payload },
    update: { payload }
  });

  // 2. Process order
  if (payload.event_type === 'order.created' || payload.event_type === 'order.updated') {
    await this.ordersService.upsertOrderFromWebhook(provider, payload);
  }
}
```

**Order Upsert:**
```typescript
async upsertOrderFromWebhook(provider: Provider, payload: any) {
  // Find merchant by integration
  const integration = await this.integrationsService.findByProviderAndExternalId(
    provider,
    payload.shop_id
  );

  // Upsert order
  await this.prisma.marketplaceOrder.upsert({
    where: {
      merchantOrgId_provider_externalOrderId: {
        merchantOrgId: integration.orgId,
        provider,
        externalOrderId: payload.order_id
      }
    },
    create: {
      merchantOrgId: integration.orgId,
      provider,
      externalOrderId: payload.order_id,
      status: payload.status,
      buyerName: payload.buyer_name,
      totalCents: payload.total_amount * 100,
      shippingAddressJson: payload.shipping_address
    },
    update: {
      status: payload.status,
      // Update other fields as needed
    }
  });

  // Upsert order items
  for (const item of payload.items) {
    await this.prisma.marketplaceOrderItem.upsert({
      // ... similar logic
    });
  }
}
```

**Benefits:**
- Idempotent (can replay webhooks safely)
- Automatic order creation/updates
- Real-time order ingestion
- Status updates from marketplace

---

## Scalability for Future Providers

### Adding a new marketplace (e.g., Amazon):

1. **Add to Prisma enum:**
   ```prisma
   enum Provider {
     SHOPEE
     MERCADOLIVRE
     AMAZON  // Add new provider
   }
   ```

2. **Run migration:**
   ```bash
   npx prisma migrate dev
   ```

3. **Update frontend types:**
   ```typescript
   export type Provider = 'SHOPEE' | 'MERCADOLIVRE' | 'AMAZON';
   ```

4. **Add badge color in OrdersPage:**
   ```typescript
   case 'AMAZON':
     return 'bg-blue-100 text-blue-800';
   ```

**That's it!** All filtering logic is provider-agnostic and will automatically work with new providers.

---

## Testing Scenarios

### Scenario 1: No Integrations
- **Setup:** Merchant org with no integrations
- **Expected:** Empty state with "Connect marketplace" message
- **API Response:** `{ providers: [], items: [], total: 0 }`

### Scenario 2: Shopee Only
- **Setup:** Merchant with active Shopee integration
- **Expected:** Only "All" and "SHOPEE" filter buttons, only Shopee orders shown
- **API Response:** `{ providers: ['SHOPEE'], items: [...], total: X }`

### Scenario 3: Both Marketplaces
- **Setup:** Merchant with Shopee and Mercado Livre active
- **Expected:** All three filter buttons, all orders shown
- **API Response:** `{ providers: ['SHOPEE', 'MERCADOLIVRE'], items: [...], total: X }`

### Scenario 4: Filter by Provider
- **Setup:** Select "SHOPEE" filter
- **Expected:** Only Shopee orders shown
- **API Call:** `GET /orders?provider=SHOPEE`

### Scenario 5: Search
- **Setup:** Type "123456" in search
- **Expected:** Only orders with "123456" in order ID or buyer name
- **API Call:** `GET /orders?search=123456`

### Scenario 6: Pagination
- **Setup:** 100 orders, page size 20
- **Expected:** 5 pages, shows 20 orders per page
- **API Calls:** `GET /orders?page=1`, `GET /orders?page=2`, etc.

### Scenario 7: Auto-Refresh
- **Setup:** Leave page open
- **Expected:** Data refreshes every 30 seconds automatically
- **Behavior:** "Last updated" timestamp updates, no loading spinner

### Scenario 8: Order Details
- **Setup:** Click "View Details" on an order
- **Expected:** Navigate to `/orders/:id`, show full order details
- **API Call:** `GET /orders/:id`

---

## What's Still Pending for Real Marketplace Integration

The current implementation provides the **complete UI and architecture** for order management, but actual marketplace API integration is not yet implemented. To complete real integration:

### 1. Shopee API Integration
- Implement real Shopee OAuth flow
- Fetch orders from Shopee API
- Handle Shopee webhooks for order events
- Map Shopee order structure to our schema

### 2. Mercado Livre API Integration
- Implement Mercado Livre OAuth flow
- Fetch orders from Mercado Livre API
- Handle Mercado Livre webhooks
- Map Mercado Livre order structure to our schema

### 3. Webhook Handlers
- Create webhook endpoints for each provider
- Implement idempotency (prevent duplicate processing)
- Parse webhook payloads
- Upsert orders and items
- Update order statuses

### 4. Background Jobs
- Periodic order sync (fallback for missed webhooks)
- Order status polling
- Fulfillment status updates
- Error retry logic

### 5. Order Creation Flow
- When listing sells on marketplace
- Marketplace sends webhook
- Create order in our system
- Create fulfillment order for supplier
- Notify supplier

**Current Status:** The infrastructure is ready. When you implement real marketplace integration, orders will automatically appear in the UI with proper filtering, pagination, and real-time updates.

---

## API Endpoints Summary

### Orders
- `GET /orders` - List orders (filtered by connected providers)
  - Query params: `provider`, `status`, `search`, `from`, `to`, `page`, `pageSize`
  - Returns: `{ providers: [], items: [], page: 1, pageSize: 20, total: 53 }`
- `GET /orders/:id` - Get order details
  - Returns: Full order with items and fulfillments

All endpoints require:
- `Authorization: Bearer {jwt_token}`
- `x-org-id: {organization_id}`

---

## Files Created/Modified

### Backend Files Created:
1. `src/modules/orders/dto/get-orders.dto.ts` - Query parameters DTO

### Backend Files Modified:
1. `src/modules/orders/orders/orders.service.ts` - Complete orders service implementation
2. `src/modules/orders/orders/orders.controller.ts` - Orders controller with GET endpoints
3. `src/modules/orders/orders.module.ts` - Added PrismaModule and IntegrationsModule imports

### Frontend Files Created:
1. `web/src/lib/api/orders.ts` - Orders API client
2. `web/src/hooks/useOrders.ts` - Orders hooks with auto-refresh
3. `web/src/pages/orders/OrderDetailsPage.tsx` - Order details page

### Frontend Files Modified:
1. `web/src/types/index.ts` - Added Order types (MarketplaceOrder, OrdersResponse, OrderDetails, GetOrdersParams)
2. `web/src/lib/api/index.ts` - Export ordersApi
3. `web/src/pages/orders/OrdersPage.tsx` - Complete rewrite with filtering, pagination, auto-refresh
4. `web/src/i18n/locales/en.json` - Added comprehensive orders translations
5. `web/src/i18n/locales/pt.json` - Added Portuguese orders translations
6. `web/src/i18n/locales/es.json` - Added Spanish orders translations

### Documentation:
- 📄 Created: `ORDERS_IMPLEMENTATION.md` - Complete technical documentation

---

## Summary

✅ **Complete merchant orders flow implemented**
✅ **Orders filtered by active marketplace integrations**
✅ **Near-real-time updates with 30-second auto-refresh**
✅ **Comprehensive filtering** (provider, status, search, date range)
✅ **Production-ready pagination**
✅ **Order details page with full information**
✅ **Fulfillment tracking integration**
✅ **Clean, scalable architecture for future providers**
✅ **Full internationalization support** (en, pt, es)
✅ **Proper error handling and empty states**
✅ **Type-safe throughout backend and frontend**
✅ **Optimized queries** (no N+1, indexed sorting, pagination)
✅ **Security validated** (JWT, OrgGuard, org scoping, provider validation)

The system is **production-ready** for order monitoring and management. When you're ready to implement actual marketplace API integration and webhooks, the infrastructure is in place to support it seamlessly. The near-real-time polling provides a solid user experience while you build out true real-time WebSocket integration.
