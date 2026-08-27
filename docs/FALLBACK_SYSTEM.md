# Fallback System - AI ROI Calculator

## Overview

The AI ROI Calculator includes a sophisticated fallback system that ensures the application remains functional even when the Rust backend API is unavailable.

## Architecture

```
┌─────────────────┐
│   Next.js App   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   API Routes    │
│  /api/roi/*     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│  roi-api.ts     │─────▶│  Rust/rspc API   │
│  Server Actions │      │  (Primary)       │
└────────┬────────┘      └──────────────────┘
         │
         │ (on failure)
         ▼
┌─────────────────┐
│  Fallback Logic │
│  TypeScript     │
└─────────────────┘
```

## How It Works

### 1. Request Flow

1. **User Interaction**: User submits ROI calculation form
2. **API Route**: Request sent to `/api/roi/calculate`
3. **Server Action**: `calculateROI()` in `lib/api/roi-api.ts`
4. **Primary Attempt**: Fetch from Rust backend with 5s timeout
5. **Fallback**: On failure, use TypeScript calculation
6. **Response**: Return result with `source` indicator

### 2. Configuration

Environment variables control fallback behavior:

```env
# Force fallback mode (for testing)
USE_MOCK_DATA=true

# Rust API URL (empty = auto-fallback)
RUST_API_URL=

# In production
RUST_API_URL=https://api.your-domain.com
USE_MOCK_DATA=false
```

### 3. Fallback Triggers

The system automatically falls back when:

- `RUST_API_URL` is not set
- `USE_MOCK_DATA=true`
- Rust API timeout (5 seconds)
- Rust API returns error response
- Network connection failure

### 4. Mock Data

Mock data is provided for:

- **Subscription Plans**: 3 tiers (Starter, Professional, Enterprise)
- **Industry Benchmarks**: 5 industries + default
- **Calculations**: Full TypeScript implementation

## Implementation Details

### calculateROI()

```typescript
export async function calculateROI(input: ROICalculationInput) {
  // Validate input
  const validated = ROICalculationInputSchema.parse(input)

  // Try Rust API first (if available)
  if (!USE_FALLBACK) {
    try {
      const response = await fetch(`${RUST_API_URL}/rspc/calculateROI`, {
        signal: AbortSignal.timeout(5000),
        // ...
      })
      if (response.ok) {
        return { success: true, data, source: "rust-api" }
      }
    } catch (error) {
      // Log and continue to fallback
    }
  }

  // Fallback calculation
  const data = calculateROIFallback(validated)
  return { success: true, data, source: "fallback" }
}
```

### Fallback Calculation Logic

The TypeScript fallback implements the same algorithm as the Rust backend:

1. **Labor Cost Savings**
   - Calculate hourly rate from annual salary
   - Apply 60% automation rate to manual hours
   - Multiply by employee count

2. **Error Reduction Savings**
   - Estimate error cost (15% of salary)
   - Apply 70% error reduction rate
   - Factor in current error rate

3. **Downtime Reduction Savings**
   - Calculate downtime cost per hour
   - Apply 50% downtime reduction
   - Calculate annual savings

4. **Compliance Savings**
   - Apply 40% reduction to compliance costs

5. **ROI Calculation**
   - Net benefit = Total savings - Annual plan cost
   - ROI % = (Net benefit / Annual cost) × 100
   - Payback months = Annual cost / Monthly savings

6. **Maturity Score**
   - Average of 5 strategic factors
   - Used for recommendations

## Testing Fallback System

### Force Fallback Mode

```bash
# In .env.local
USE_MOCK_DATA=true
```

### Test API Failure

```typescript
// Temporarily break API URL
RUST_API_URL=http://invalid-url:9999
```

### Verify Fallback

1. Open browser DevTools Console
2. Submit ROI calculation
3. Look for: `[v0] Rust API unavailable, using fallback calculation`
4. Check response has `"source": "fallback"`

## User Experience

### Transparent Operation

Users should not notice the difference:
- Same calculation results
- Same response time (fallback is faster)
- No error messages shown

### Development Indicator

In development, console shows:
```
[v0] Rust API unavailable, using fallback calculation
[v0] Using mock subscription plans
[v0] Using mock industry benchmark
```

### Error Handling

If both Rust API and fallback fail:
- User sees friendly error message
- Client-side calculation triggered
- Results still displayed

## Performance

### Rust API (Primary)

- **Average**: 50-100ms
- **P95**: 200ms
- **Timeout**: 5000ms

### TypeScript Fallback

- **Average**: 5-10ms
- **P95**: 20ms
- **No network latency**

### Mock Data

- **Instant**: No network or computation
- **Cached**: SWR caching for 1 hour

## Monitoring

### Log Patterns

```typescript
// Successful Rust API call
// (no logs)

// Fallback triggered
console.log("[v0] Rust API unavailable, using fallback calculation")

// Mock data used
console.log("[v0] Using mock subscription plans")
```

### Metrics to Track

- Fallback usage rate
- API timeout frequency
- Calculation accuracy comparison
- User error reports

## Best Practices

### Development

1. Use `USE_MOCK_DATA=true` for fast iteration
2. Test both Rust API and fallback paths
3. Verify calculations match between both

### Staging

1. Use real Rust API
2. Monitor fallback trigger rate
3. Compare results between API and fallback

### Production

1. Set `USE_MOCK_DATA=false`
2. Monitor API availability
3. Alert on high fallback usage
4. Regular Rust API health checks

## Troubleshooting

### Fallback Always Triggered

**Check:**
- Is RUST_API_URL set correctly?
- Is Rust API running?
- Can frontend reach backend?
- Firewall/security group rules?

### Incorrect Calculations

**Check:**
- Input validation working?
- Algorithm matches between Rust/TypeScript?
- Currency/unit conversions consistent?

### Performance Issues

**Check:**
- Is fallback slower than expected?
- Database queries optimized?
- Caching working properly?

## Future Enhancements

1. **Smart Fallback**: Learn when to use fallback based on API health
2. **Hybrid Mode**: Use fallback for preview, API for final calculation
3. **Caching**: Cache Rust API results to reduce load
4. **Analytics**: Track which calculation source users prefer

---

**Last Updated**: January 2026
**Version**: 1.0.0
