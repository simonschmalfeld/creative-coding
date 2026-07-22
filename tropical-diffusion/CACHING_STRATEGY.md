# Aggressive Caching Strategy

## Problem
Replicate has rate limits that can be hit quickly when generating many flowers. We need to minimize API calls.

## Solution: Three-Layer Caching

### 1. Color Bucketing (Reduces Unique Variations)

**Before**: Every slight color variation created a new texture
- `rgb(220, 20, 60)` → "crimson red"
- `rgb(225, 25, 65)` → "bright crimson"
- `rgb(215, 18, 55)` → "deep crimson"
- Result: 100+ unique textures needed

**After**: All similar colors map to same bucket
- `rgb(220, 20, 60)` → "red"
- `rgb(225, 25, 65)` → "red"
- `rgb(215, 18, 55)` → "red"
- Result: Only 3 buckets per flower type

#### Color Buckets
Each flower type has exactly 3 color variations:
- **Red**: Deep crimson, scarlet, pure red
- **Pink**: Coral, magenta, rose, hot pink
- **White**: Cream, ivory, pale yellow

#### Total Unique Textures
- 3 flower types × 3 colors = **9 textures maximum**
- First 9 flowers: API calls (~$0.02)
- All subsequent flowers: Cache hits ($0.00)

### 2. In-Memory Cache (Fast)

```javascript
this.cache = new Map(); // Key: "flowerType-colorBucket"
```

- Instant lookup: O(1)
- Session-scoped: Cleared on page refresh
- Used for immediate cache hits during session

### 3. localStorage Persistence (Survives Refresh)

```javascript
localStorage.setItem('tropical_diffusion_texture_cache', JSON.stringify(cache));
```

- Survives page refreshes
- Survives browser restarts
- Automatically loaded on app startup
- Users only generate 9 textures once, then forever cached

## Cache Performance

### First Session
```
Flower 1 (hibiscus-red):     API call (2-4s, $0.0023)
Flower 2 (hibiscus-pink):    API call (2-4s, $0.0023)
Flower 3 (hibiscus-white):   API call (2-4s, $0.0023)
Flower 4 (plumeria-red):     API call (2-4s, $0.0023)
Flower 5 (plumeria-pink):    API call (2-4s, $0.0023)
Flower 6 (plumeria-white):   API call (2-4s, $0.0023)
Flower 7 (bougainvillea-red):   API call (2-4s, $0.0023)
Flower 8 (bougainvillea-pink):  API call (2-4s, $0.0023)
Flower 9 (bougainvillea-white): API call (2-4s, $0.0023)
Flower 10+: Cache hits (instant, $0.00)

Total cost: ~$0.02
Total time: ~18-36 seconds for first 9, then instant
```

### Second Session (After Refresh)
```
All flowers: Cache hits from localStorage (instant, $0.00)

Total cost: $0.00
Total time: Instant
```

### Rate Limit Protection
- **Without caching**: 100 flowers = 100 API calls (rate limit hit)
- **With aggressive caching**: 100 flowers = 9 API calls (under limit)
- **Reduction**: 91% fewer API calls

## Usage

### Debug Cache Stats
Press **'D'** key to see cache statistics in console:
```
=== CACHE STATS ===
Cache size: 9
Cache entries: [
  "hibiscus-red",
  "hibiscus-pink",
  "hibiscus-white",
  "plumeria-red",
  "plumeria-pink",
  "plumeria-white",
  "bougainvillea-red",
  "bougainvillea-pink",
  "bougainvillea-white"
]
==================
```

### Clear Cache
```javascript
// In browser console
replicateService.clearCache();
```

This clears both in-memory and localStorage caches.

## Benefits

### Cost Savings
- **Demo session**: $0.02 (9 unique textures)
- **Production use**: $0.02 total (cached forever)
- **Savings vs naive approach**: 90-95% reduction

### Performance
- First 9 unique flowers: 2-4s each
- All subsequent flowers: <100ms (cache hit)
- No waiting after initial warmup

### User Experience
- Predictable: Always 9 variations
- Fast: After warmup, instant textures
- Reliable: Works offline after cache populated
- Persistent: Survives browser close

## Trade-offs

### Pros
- ✅ Minimal API costs
- ✅ No rate limiting issues
- ✅ Fast after warmup
- ✅ Persistent across sessions

### Cons
- ❌ Only 3 color variations per flower type
- ❌ Less color diversity than full palette
- ❌ First session has delay for 9 textures

## Future Enhancements

1. **Pre-warming**: Generate all 9 textures on first load
2. **Batch mode**: Generate offline, bundle with app
3. **Quality selector**: Let users choose detail level
4. **Custom colors**: Allow users to request specific shades

## Technical Details

### Cache Key Format
```javascript
const cacheKey = `${flowerType}-${colorBucket}`;
// Examples:
// "hibiscus-red"
// "plumeria-pink"
// "bougainvillea-white"
```

### localStorage Schema
```json
[
  ["hibiscus-red", "https://replicate.delivery/..."],
  ["hibiscus-pink", "https://replicate.delivery/..."],
  ["hibiscus-white", "https://replicate.delivery/..."],
  ...
]
```

### Color Bucketing Algorithm
```javascript
getColorDescription(color) {
  const r = color.levels[0];
  const g = color.levels[1];
  const b = color.levels[2];
  const brightness = (r + g + b) / 3;

  // Red bucket: r > 180, low g/b
  // Pink bucket: r > 180, moderate g/b
  // White bucket: brightness > 200
}
```

## Monitoring

### Console Logs
```
💾 Loaded 9 cached textures from localStorage
🎨 Generating texture with prompt: vibrant red hibiscus...
✅ Texture generated and cached: hibiscus-red
💾 Saved 1 textures to localStorage
💾 Using cached texture for hibiscus-red
```

### Metrics to Track
- Cache hit rate: Should be >90% after warmup
- API calls per session: Should max out at 9
- Load time: Should be instant after warmup
- Cost per session: Should be $0.00 after first use

---

**Result**: Sustainable, cost-effective AI texture integration that respects rate limits and provides excellent UX.
