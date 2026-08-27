# API Integration Documentation

## Overview

The Kronova AI ROI Calculator uses a hybrid architecture:
- **Next.js API Routes**: Handles authentication, validation, and proxying
- **Rust/rspc Backend**: High-performance ROI calculations and data processing
- **Supabase**: Database storage and user management

## Architecture

```
┌─────────────────┐
│   Next.js App   │
│  (React + TS)   │
└────────┬────────┘
         │
         ├─────────────────┬──────────────────┐
         │                 │                  │
┌────────▼────────┐ ┌─────▼──────┐  ┌───────▼────────┐
│  Next.js API    │ │  Rust API  │  │   Supabase     │
│    Routes       │ │   (rspc)   │  │   PostgreSQL   │
└─────────────────┘ └────────────┘  └────────────────┘
```

## API Endpoints

### Next.js API Routes

**POST /api/roi/calculate**
Calculate ROI based on organization inputs.

Request:
```typescript
{
  organizationProfile: {
    employees: number
    avgSalary: number
    industry: string
    companySize: string
  },
  operationsMetrics: {
    manualHours: number
    errorRate: number
    systemDowntime: number
    complianceCosts: number
  },
  infrastructureData: {
    dataQuality: number
    integrationComplexity: number
    legacySystemAge: number
    cloudReadiness: number
  },
  strategicFactors: {
    aiMaturity: number
    changeReadiness: number
    executiveSupport: number
    competitivePressure: number
  },
  selectedPlan: string
  saveToDatabase?: boolean
  userId?: string
}
```

Response:
```typescript
{
  success: true,
  calculation: {
    id: string
    results: ROIResults
    // ... other fields
  }
}
```

**GET /api/roi/plans**
Get available subscription plans.

Response:
```typescript
{
  success: true,
  plans: SubscriptionPlan[]
}
```

**GET /api/roi/benchmark?industry={industry}**
Get industry-specific benchmarks.

Response:
```typescript
{
  success: true,
  benchmark: IndustryBenchmark
}
```

### Rust Backend (rspc)

**Query: version**
Get API version.

**Query: subscriptionPlans**
List all subscription plans.

**Query: industryBenchmark**
Get industry benchmark data.

**Query: getCalculation**
Retrieve a specific calculation.

**Query: listCalculations**
List user's calculations.

**Mutation: calculateROI**
Perform ROI calculation.

## Client-Side Usage

### React Hook

```typescript
import { useROICalculator } from "@/hooks/use-roi-calculator"

function MyComponent() {
  const {
    calculate,
    isCalculating,
    calculationResult,
    error,
    subscriptionPlans
  } = useROICalculator()

  const handleCalculate = async () => {
    const result = await calculate({
      organizationProfile: { /* ... */ },
      operationsMetrics: { /* ... */ },
      infrastructureData: { /* ... */ },
      strategicFactors: { /* ... */ },
      selectedPlan: "Professional"
    })

    if (result.success) {
      console.log("ROI:", result.data.results.roi)
    }
  }

  return (
    <button onClick={handleCalculate} disabled={isCalculating}>
      Calculate ROI
    </button>
  )
}
```

### Direct API Call

```typescript
const response = await fetch("/api/roi/calculate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(input)
})

const data = await response.json()
```

## Server-Side Usage

```typescript
import { calculateROI } from "@/lib/api/roi-api"

export async function GET() {
  const result = await calculateROI({
    // ... input data
  })

  if (result.success) {
    return Response.json(result.data)
  }

  return Response.json(
    { error: result.error },
    { status: 500 }
  )
}
```

## Error Handling

```typescript
try {
  const result = await calculate(input)
  
  if (!result.success) {
    // Handle API error
    console.error(result.error)
  }
} catch (error) {
  // Handle network/unexpected error
  if (isNetworkError(error)) {
    // Retry logic
  }
}
```

## Caching Strategy

- **Subscription Plans**: 1 hour (server-side)
- **Industry Benchmarks**: 24 hours (server-side)
- **Calculations**: No cache (always fresh)
- **Client-side**: SWR with 5-minute stale time

## Authentication

For authenticated requests:

```typescript
const response = await fetch("/api/roi/calculate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify(input)
})
```

## Rate Limiting

- Anonymous: 10 requests/hour
- Authenticated: 100 requests/hour
- Enterprise: Unlimited

## Testing

```bash
# Test Next.js API
npm run test:api

# Test Rust backend
cd rust-api && cargo test

# Integration tests
npm run test:integration
```

## Monitoring

Track these metrics:
- API response times
- Error rates
- Cache hit rates
- Calculation accuracy
- User conversion rates

## Resources

- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [rspc Documentation](https://rspc.dev/)
- [SWR Documentation](https://swr.vercel.app/)
