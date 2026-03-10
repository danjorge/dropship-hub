# Quick Start Guide

## 🚀 Get the Frontend Running in 3 Steps

### Step 1: Install Dependencies

```bash
cd web
pnpm install
```

This will install all required packages including React, TypeScript, Vite, TanStack Query, React Router, React Hook Form, Zod, and Tailwind CSS.

### Step 2: Start the Backend

Make sure your backend is running on `http://localhost:3000`:

```bash
# In the root directory
cd ..
pnpm run start:dev
```

The backend should be accessible at `http://localhost:3000`.

### Step 3: Start the Frontend

```bash
# In the web directory
cd web
pnpm dev
```

The frontend will start on `http://localhost:3001` and automatically proxy API requests to the backend.

## 🔑 Login

Open your browser to `http://localhost:3001/login`

**Demo Credentials:**
- Email: `admin@dropship.local`
- Password: `admin123`

## 📋 What to Expect

After logging in, you'll:

1. **Select an Organization** - Choose which org to work with (Supplier or Merchant)
2. **View Dashboard** - See overview of your org
3. **Navigate Features** - Use the sidebar to access:
   - **Suppliers**: Products, Fulfillments
   - **Merchants**: Suppliers, Listings

## 🎯 Key Features Implemented

### ✅ Authentication
- Login page with form validation
- JWT token storage
- Protected routes
- Auto-logout on 401

### ✅ Multi-Tenancy
- Organization selection
- Organization switcher in header
- Automatic `x-org-id` header injection
- Role-based sidebar navigation

### ✅ Supplier Features
- Products list page
- Create product form
- Fulfillments list

### ✅ Merchant Features
- Browse suppliers
- Listings management
- Supplier product browsing (route ready)

### ✅ Core Infrastructure
- React Query for server state
- React Hook Form + Zod validation
- Tailwind CSS styling
- TypeScript throughout
- API client with interceptors
- Reusable components

## 🛠️ Development Tips

### Hot Reload
Both frontend and backend support hot reload. Changes will reflect immediately.

### API Proxy
The frontend proxies `/api` requests to `http://localhost:3000`. No CORS issues.

### React Query DevTools
Press the React Query icon in the bottom-left to inspect queries and mutations.

### Type Safety
All API responses are typed. TypeScript will catch errors at compile time.

## 📁 Project Structure

```
web/
├── src/
│   ├── app/           # App setup (providers, router)
│   ├── components/    # Reusable UI components
│   ├── contexts/      # Auth & Org contexts
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # API client & utilities
│   ├── pages/         # Page components
│   └── types/         # TypeScript types
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## 🐛 Common Issues

### Port Already in Use
If port 3001 is taken, Vite will prompt you to use another port.

### Backend Not Running
Ensure the backend is running on port 3000. Check with:
```bash
curl http://localhost:3000/health
```

### Dependencies Not Installed
Run `pnpm install` in the `web` directory.

### TypeScript Errors
All TypeScript errors shown in the IDE are expected until you run `pnpm install`. They will disappear once dependencies are installed.

## 📚 Next Steps

1. **Explore the Code** - Check out the clean architecture
2. **Add Features** - Build on the solid foundation
3. **Customize UI** - Modify Tailwind classes
4. **Add Pages** - Follow existing patterns
5. **Read README.md** - Comprehensive documentation

## 🎨 Customization

### Change Colors
Edit `tailwind.config.js` to customize the color palette.

### Add Routes
Add new routes in `src/app/router.tsx`.

### Create Pages
Follow the pattern in `src/pages/` directories.

### Add API Endpoints
Add new API modules in `src/lib/api/`.

## ✨ What's Next?

The MVP is complete! Here are suggested next features:

- [ ] Product detail page with SKU management
- [ ] Listing creation form
- [ ] Order management
- [ ] File upload for images
- [ ] Advanced filtering
- [ ] Real-time notifications
- [ ] Analytics dashboard

Happy coding! 🚀
