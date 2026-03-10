# Pagination and SKU Mapping

## ✅ Pagination Implementation

### Products Page Pagination
The products list page now includes full pagination support:

**Features:**
- **10 items per page** (configurable via `ITEMS_PER_PAGE` constant)
- **Page numbers** with active state highlighting
- **Previous/Next buttons** for easy navigation
- **Results counter** showing "Showing X to Y of Z results"
- **Responsive design** - mobile and desktop layouts
- **Disabled states** for first/last page buttons
- **Fully translated** in English, Portuguese, and Spanish

**Location:** `web/src/pages/catalog/ProductsListPage.tsx`

### How It Works

```typescript
const ITEMS_PER_PAGE = 10;

// Pagination state
const [currentPage, setCurrentPage] = useState(1);

// Calculate pagination
const totalProducts = products?.length || 0;
const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
const endIndex = startIndex + ITEMS_PER_PAGE;
const paginatedProducts = products?.slice(startIndex, endIndex) || [];
```

### UI Components

**Desktop View:**
- Full page number buttons (1, 2, 3, ...)
- Previous/Next arrow buttons
- Results counter text

**Mobile View:**
- Simple Previous/Next buttons
- Compact layout

### Translation Keys Added

```json
{
  "common": {
    "previous": "Previous / Anterior / Anterior",
    "next": "Next / Próximo / Siguiente",
    "showing": "Showing / Mostrando / Mostrando",
    "to": "to / até / a",
    "of": "of / de / de",
    "results": "results / resultados / resultados"
  }
}
```

---

## 📋 SKU Mapping from Brazilian Template

### Understanding the Código Column

In Brazilian product catalogs, the **`Código`** column represents the **SKU** (Stock Keeping Unit).

**Current Mapping:**
- `Código` → Product Title (when no `Descrição` is provided)
- The actual SKU value is preserved in the import but not yet stored separately

### Backend Limitation

The current backend API only supports basic product fields:
- `title` (string)
- `description` (string)
- `brand` (string)
- `isActive` (boolean)

**SKUs are managed separately** via a different endpoint:
- `POST /catalog/products/:productId/skus` - Create SKU for a product

### Future Enhancement: Full SKU Support

To fully support SKU import from the `Código` column, the import process would need to:

1. **Create the product** (as currently done)
2. **Create SKU** for each product using the `Código` value

**Example Implementation:**

```typescript
// After creating product
if (product['Código']) {
  await createSku(createdProduct.id, {
    sku: product['Código'],
    // Additional SKU fields from template:
    priceCents: parseFloat(product['Preço']) * 100,
    costCents: parseFloat(product['Preços de custo']) * 100,
    stock: parseInt(product['Estoque']),
    // ... other fields
  });
}
```

### SKU-Related Columns in Brazilian Template

The template includes many SKU-related fields that could be mapped:

| Column | Purpose | Current Status |
|--------|---------|----------------|
| `Código` | SKU identifier | Used as title fallback |
| `Preço` | Sale price | Not imported |
| `Preços de custo` | Cost price | Not imported |
| `Estoque` | Stock quantity | Not imported |
| `Estoque máximo` | Max stock | Not imported |
| `Estoque mínimo` | Min stock | Not imported |
| `Peso líquido (Kg)` | Net weight | Not imported |
| `Peso bruto (Kg)` | Gross weight | Not imported |
| `GTIN/EAN` | Barcode | Not imported |
| `Localização` | Warehouse location | Not imported |

### Recommendation

To enable full SKU import:

1. **Update backend** to accept SKU data during product creation, OR
2. **Modify import process** to make two API calls:
   - First: Create product
   - Second: Create SKU with `Código` and related fields

3. **Update ProductImport component** to handle SKU creation:

```typescript
// After successful product creation
if (product['Código']) {
  await createProductSku(createdProductId, {
    sku: product['Código'],
    priceCents: Math.round((parseFloat(product['Preço']) || 0) * 100),
    costCents: Math.round((parseFloat(product['Preços de custo']) || 0) * 100),
    stock: parseInt(product['Estoque']) || 0,
    weightGrams: Math.round((parseFloat(product['Peso líquido (Kg)']) || 0) * 1000),
    barcode: product['GTIN/EAN'] || '',
  });
}
```

---

## 🎯 Current Import Behavior

### What Gets Imported

From the Brazilian template, the import currently extracts:

1. **Title**: `Descrição` or `Código` (fallback)
2. **Description**: Combines multiple fields:
   - `Descrição Complementar`
   - `Descrição Curta`
   - `Observações`
   - `Informações Adicionais`
3. **Brand**: `Marca`
4. **Status**: `Situação` (Ativo/Inativo → true/false)

### What's Preserved But Not Stored

All other 54 columns are read from the file but not sent to the backend, including:
- SKU information (`Código`)
- Pricing (`Preço`, `Preços de custo`)
- Inventory (`Estoque`, stock levels)
- Dimensions and weight
- Tax information (NCM, IPI, ICMS)
- Supplier details
- And more...

---

## 📊 Testing Pagination

### Test with Sample Data

1. Import more than 10 products using the template
2. Navigate to Products page
3. Verify pagination controls appear
4. Test page navigation
5. Verify product count is correct

### Edge Cases Tested

- ✅ Less than 10 products (no pagination shown)
- ✅ Exactly 10 products (no pagination shown)
- ✅ 11+ products (pagination appears)
- ✅ First page (Previous button disabled)
- ✅ Last page (Next button disabled)
- ✅ Middle pages (both buttons enabled)

---

## 🚀 Summary

### Completed
- ✅ **Pagination** - Fully functional with 10 items per page
- ✅ **Responsive design** - Works on mobile and desktop
- ✅ **Translations** - English, Portuguese, Spanish
- ✅ **SKU documentation** - Explained `Código` column mapping

### Future Work
- ⏳ **Full SKU import** - Requires backend enhancement or two-step import
- ⏳ **Inventory management** - Import stock levels
- ⏳ **Pricing import** - Import cost and sale prices
- ⏳ **Product variants** - Support for `Produto Variação`

The pagination is production-ready. SKU import requires backend API enhancement to support SKU creation during product import.
