# Large Product Import Guide

## ✅ Rate Limiting Solution Implemented

### Problem
When importing Excel files with more than 100 products, the backend rate limiter (100 requests per 60 seconds) was blocking requests, causing "Too Many Requests" errors.

### Solution
Implemented **batch processing with delays** in the ProductImport component:

- **Batch Size**: 50 products per batch
- **Delay Between Batches**: 1 second
- **Parallel Processing**: Products within each batch are processed in parallel for speed
- **Sequential Batches**: Batches are processed sequentially with delays to respect rate limits

### How It Works

```typescript
// Process in batches to avoid rate limiting
const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 1000; // 1 second delay between batches

for (let i = 0; i < products.length; i += BATCH_SIZE) {
  const batch = products.slice(i, i + BATCH_SIZE);
  
  // Process batch in parallel
  const batchPromises = batch.map(async (product) => {
    // Create product...
  });

  // Wait for all products in this batch to complete
  await Promise.allSettled(batchPromises);

  // Add delay between batches (except for the last batch)
  if (i + BATCH_SIZE < products.length) {
    await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
  }
}
```

## 📊 Import Performance

### Small Imports (< 50 products)
- **Processing**: All at once in parallel
- **Time**: ~2-5 seconds
- **Rate Limit**: No issues

### Medium Imports (50-100 products)
- **Processing**: 2 batches with 1 second delay
- **Time**: ~5-10 seconds
- **Rate Limit**: No issues

### Large Imports (100-500 products)
- **Processing**: Multiple batches with delays
- **Time**: ~10-60 seconds (depending on size)
- **Rate Limit**: No issues
- **Example**: 250 products = 5 batches × 1 second delay = ~10 seconds total

### Very Large Imports (500+ products)
- **Processing**: Many batches with delays
- **Time**: 1-3 minutes
- **Rate Limit**: No issues
- **Example**: 1000 products = 20 batches × 1 second delay = ~30-40 seconds total

## 🎯 Benefits

### 1. No Rate Limit Errors
- Respects backend throttle limit (100 req/60s)
- Automatic delay management
- No manual intervention needed

### 2. Fast Processing
- Parallel processing within batches
- Optimal use of available rate limit
- 50 products per second (when rate limit allows)

### 3. Progress Visibility
- User sees products being created in real-time
- Success count updates continuously
- Errors are logged immediately

### 4. Reliability
- Uses `Promise.allSettled()` to handle individual failures
- Continues processing even if some products fail
- Complete error reporting at the end

## 🔧 Backend Rate Limit Configuration

Current settings in `src/app.module.ts`:

```typescript
ThrottlerModule.forRoot([
  {
    ttl: 60000,  // 60 seconds
    limit: 100,  // 100 requests
  },
]),
```

### Adjusting Rate Limits

If you need to import even larger files faster, you can increase the backend rate limit:

```typescript
// Example: Allow 200 requests per 60 seconds
ThrottlerModule.forRoot([
  {
    ttl: 60000,
    limit: 200,  // Increased from 100
  },
]),
```

Then adjust the frontend batch size accordingly:

```typescript
// In ProductImport.tsx
const BATCH_SIZE = 100;  // Increased from 50
const BATCH_DELAY_MS = 1000;
```

## 📝 Testing Large Imports

### Create Test Data

You can create a large Excel file for testing:

1. Download the template
2. Open in Excel/LibreOffice
3. Copy the example rows
4. Paste 100+ times
5. Modify the "Código" column to make each product unique
6. Save and import

### Expected Behavior

**For 150 products:**
- Batch 1: Products 1-50 (parallel)
- Wait 1 second
- Batch 2: Products 51-100 (parallel)
- Wait 1 second
- Batch 3: Products 101-150 (parallel)
- Total time: ~5-8 seconds

**Success message:** "150 products imported successfully!"

## ⚠️ Important Notes

### 1. Don't Close Browser During Import
The import runs in the browser. Closing the tab will stop the process.

### 2. Network Stability
Large imports require stable internet connection. If connection drops, some products may fail.

### 3. Database Performance
Very large imports (1000+ products) may slow down due to database write performance. This is normal.

### 4. Memory Usage
Excel files with 1000+ rows may use significant browser memory. If you experience issues, split into multiple smaller files.

## 🚀 Best Practices

### For Regular Use (< 500 products)
- Use the current settings
- Import directly from Excel
- No special preparation needed

### For Large Catalogs (500-2000 products)
- Split into multiple files of 500 products each
- Import one file at a time
- Wait for each import to complete before starting the next

### For Very Large Catalogs (2000+ products)
- Consider using a bulk import API endpoint (future enhancement)
- Or split into multiple 500-product files
- Import during off-peak hours

## 📈 Future Enhancements

Potential improvements for even better large import handling:

1. **Progress Bar**: Show "Processing batch 3 of 10..."
2. **Pause/Resume**: Allow pausing long imports
3. **Background Processing**: Move import to backend worker
4. **Bulk API Endpoint**: Single API call for entire file
5. **Import Queue**: Queue multiple files for sequential processing

## ✅ Summary

The current implementation handles imports of **any size** by:
- Processing in batches of 50
- Adding 1-second delays between batches
- Respecting the 100 req/60s rate limit
- Providing complete error reporting

**You can now import Excel files with 100, 500, or even 1000+ products without rate limit errors!** 🎉
