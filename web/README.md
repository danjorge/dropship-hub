# Dropship Hub - Frontend

Modern React + TypeScript frontend for the Dropshipping Hub SaaS platform.

## 🚀 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router** - Client-side routing
- **TanStack Query** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Tailwind CSS** - Styling
- **pnpm** - Package manager

## 📁 Project Structure

```
web/
├── src/
│   ├── app/                    # App configuration
│   │   ├── providers.tsx       # React Query & Context providers
│   │   └── router.tsx          # Route definitions
│   ├── components/
│   │   ├── common/             # Reusable components
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorState.tsx
│   │   │   ├── LoadingState.tsx
│   │   │   └── PageContainer.tsx
│   │   ├── layout/             # Layout components
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── OrgSwitcher.tsx
│   │   └── ProtectedRoute.tsx  # Auth guard
│   ├── contexts/               # React contexts
│   │   ├── AuthContext.tsx     # Authentication state
│   │   └── OrgContext.tsx      # Organization state
│   ├── hooks/                  # Custom hooks
│   │   ├── useCatalog.ts       # Product/catalog hooks
│   │   ├── useFulfillments.ts  # Fulfillment hooks
│   │   ├── useListings.ts      # Listing hooks
│   │   ├── useLogin.ts         # Login mutation
│   │   └── useUserOrgs.ts      # User orgs query
│   ├── lib/
│   │   ├── api/                # API client layer
│   │   │   ├── auth.ts
│   │   │   ├── catalog.ts
│   │   │   ├── client.ts       # Base API client
│   │   │   ├── fulfillments.ts
│   │   │   ├── listings.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── storage.ts      # localStorage helpers
│   │   └── constants.ts        # App constants
│   ├── pages/                  # Page components
│   │   ├── catalog/
│   │   │   ├── CreateProductPage.tsx
│   │   │   ├── ProductsListPage.tsx
│   │   │   └── SuppliersListPage.tsx
│   │   ├── fulfillments/
│   │   │   └── FulfillmentsPage.tsx
│   │   ├── listings/
│   │   │   └── ListingsPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── IntegrationsPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── OrgsPage.tsx
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   ├── App.tsx                 # Root component
│   ├── main.tsx                # Entry point
│   ├── index.css               # Global styles
│   └── vite-env.d.ts           # Vite type definitions
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+ 
- pnpm 8+
- Backend API running on `http://localhost:3000`

### Install Dependencies

```bash
cd web
pnpm install
```

### Environment Variables

Create a `.env` file in the `web` directory (optional):

```bash
# API Base URL (defaults to /api which proxies to localhost:3000)
VITE_API_BASE_URL=/api
```

The Vite dev server is configured to proxy `/api` requests to `http://localhost:3000`.

### Development

```bash
pnpm dev
```

Frontend will run on `http://localhost:3001`

### Build for Production

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

## 🔐 Authentication Flow

1. User visits `/login`
2. Submits credentials (email/password)
3. Backend returns JWT + user info
4. Frontend stores JWT in localStorage
5. Redirects to `/orgs` to select organization
6. User selects active organization
7. Organization ID stored in localStorage
8. All subsequent API requests include:
   - `Authorization: Bearer <token>`
   - `x-org-id: <orgId>` (for org-scoped endpoints)

## 🏢 Organization Switching

1. User can switch organizations via the OrgSwitcher in the header
2. Active org ID is persisted in localStorage
3. Sidebar navigation adapts based on org type:
   - **SUPPLIER**: Products, Fulfillments
   - **MERCHANT**: Suppliers, Listings

## 📡 API Integration

### API Client (`lib/api/client.ts`)

- Automatically adds `Authorization` header
- Automatically adds `x-org-id` header when required
- Handles 401 errors (redirects to login)
- Handles errors gracefully

### API Modules

- `authApi` - Login, get current user, get user orgs
- `catalogApi` - Products, SKUs, offers, suppliers
- `listingsApi` - Create and list marketplace listings
- `fulfillmentsApi` - Manage fulfillment orders

### Example Usage

```typescript
import { useProducts } from '@/hooks/useCatalog';

function ProductsList() {
  const { data, isLoading, error } = useProducts();
  
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState />;
  
  return <div>{data.map(product => ...)}</div>;
}
```

## 🎨 Styling

Uses **Tailwind CSS** for utility-first styling:

- Responsive design out of the box
- Consistent color palette
- Pre-built components with Tailwind classes
- No heavy UI library dependencies

## 🧭 Routing

### Public Routes
- `/login` - Login page

### Protected Routes (require authentication)
- `/` - Redirects to `/dashboard`
- `/orgs` - Organization selection
- `/dashboard` - Dashboard overview
- `/catalog/products` - Supplier product list
- `/catalog/products/new` - Create product
- `/catalog/suppliers` - Merchant supplier list
- `/listings` - Merchant listings
- `/fulfillments` - Supplier fulfillments
- `/integrations` - Marketplace integrations

## 📦 State Management

### Server State (TanStack Query)
- API data fetching
- Caching & invalidation
- Loading & error states
- Automatic refetching

### Client State (React Context)
- `AuthContext` - User authentication state
- `OrgContext` - Active organization state

### Local Storage
- `dropship_access_token` - JWT token
- `dropship_active_org_id` - Active organization ID

## 🔒 Security Features

- JWT token stored in localStorage
- Automatic token injection in API requests
- Protected routes with auth guard
- 401 handling (auto-logout)
- CORS configured for backend
- No sensitive data in client code

## 🧪 Testing

```bash
# Run linter
pnpm lint

# Type check
pnpm tsc --noEmit
```

## 📝 Backend Endpoints Assumed

The frontend expects these backend endpoints:

### Auth
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user
- `GET /debug/me-orgs` - Get user organizations

### Catalog (Supplier)
- `GET /catalog/products` - List products
- `POST /catalog/products` - Create product
- `POST /catalog/products/:id/skus` - Add SKU
- `POST /catalog/products/:id/images` - Add image
- `POST /catalog/offers` - Create offer

### Catalog (Merchant)
- `GET /catalog/suppliers` - List approved suppliers
- `GET /catalog/suppliers/:id/products` - Browse supplier products

### Listings (Merchant)
- `GET /listings` - List listings
- `POST /listings` - Create listing

### Fulfillments (Supplier)
- `GET /fulfillments` - List fulfillment orders
- `POST /fulfillments/:id/confirm` - Confirm fulfillment
- `POST /fulfillments/:id/ship` - Mark as shipped

## 🚧 Future Enhancements

- [ ] Product detail page with SKU/offer management
- [ ] Listing creation form
- [ ] Supplier product browsing with filters
- [ ] Order management pages
- [ ] Real-time notifications
- [ ] File upload for product images
- [ ] Bulk operations
- [ ] Advanced filtering & search
- [ ] Analytics dashboard
- [ ] Dark mode
- [ ] Internationalization (i18n)

## 🐛 Troubleshooting

### API Connection Issues

If you see CORS errors:
1. Ensure backend is running on `http://localhost:3000`
2. Check backend CORS configuration allows `http://localhost:3001`
3. Verify proxy configuration in `vite.config.ts`

### Authentication Issues

If redirected to login unexpectedly:
1. Check if JWT token is valid
2. Verify backend JWT_SECRET matches
3. Clear localStorage and try logging in again

### Build Errors

If TypeScript errors occur:
1. Run `pnpm install` to ensure all dependencies are installed
2. Delete `node_modules` and `pnpm-lock.yaml`, then reinstall
3. Check TypeScript version compatibility

## 📄 License

Proprietary - All rights reserved

## 👥 Support

For issues or questions, contact the development team.
