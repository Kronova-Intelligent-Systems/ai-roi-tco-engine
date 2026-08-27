# AI ROI Calculator - Rust/rspc Backend Integration

## Overview

The AI ROI Calculator has been integrated with the Rust/rspc backend for high-performance calculations and enterprise-grade reliability.

## Architecture

### Frontend → Backend Flow

1. **User Input** (React Component)
   - User adjusts sliders and inputs in `components/roi-calculator-section.tsx`
   - Component state updates trigger calculation

2. **React Hook** (`hooks/use-roi-calculator.ts`)
   - Manages API calls and state
   - Provides loading indicators and error handling
   - Caches subscription plans using SWR

3. **Next.js API Routes** (`app/api/roi/...`)
   - `/api/roi/calculate` - Main calculation endpoint
   - `/api/roi/plans` - Subscription plans
   - `/api/roi/benchmark` - Industry benchmarks
   - Validates input with Zod schemas
   - Forwards requests to Rust backend

4. **Rust/rspc Backend** (`rust-api/`)
   - Performs heavy calculations
   - Manages database persistence
   - Provides industry benchmarks
   - Returns structured results

## Data Flow

### Input Structure
```typescript
{
  organizationProfile: {
    employees: number
    avgSalary: number
    industry: string
    companySize: string
  },
  operationsMetrics: {
    manualHours: number (0-40)
    errorRate: number (0-100)
    systemDowntime: number (0-100)
    complianceCosts: number
  },
  infrastructureData: {
    dataQuality: number (0-100)
    integrationComplexity: number (0-100)
    legacySystemAge: number
    cloudReadiness: number (0-100)
  },
  strategicFactors: {
    aiMaturity: number (0-100)
    changeReadiness: number (0-100)
    executiveSupport: number (0-100)
    competitivePressure: number (0-100)
  },
  selectedPlan: string
}
```

### Output Structure
```typescript
{
  current_annual_cost: number
  kronova_annual_cost: number
  annual_savings: number
  roi: number (percentage)
  payback_months: number
  three_year_savings: number
  five_year_value: number
  operational_savings: number
  quality_savings: number
  strategic_value: number
  hidden_cost_reduction: number
  implementation_risk: number (0-100)
  data_quality_risk: number (0-100)
  adoption_risk: number (0-100)
  productivity_gain: number (percentage)
  error_reduction: number (percentage)
  time_to_value: number (months)
}
```

## Features

### 1. Real-time Calculations
- Debounced input changes trigger API calls
- Loading indicators show calculation status
- Results update smoothly without page reload

### 2. Offline Fallback
- Client-side calculation logic preserved
- Automatic fallback if backend unavailable
- User sees warning but can still use calculator

### 3. Error Handling
- Network errors caught and displayed
- Validation errors shown with details
- Graceful degradation to offline mode

### 4. Performance Optimization
- SWR caching for subscription plans (1 hour)
- Industry benchmarks cached (24 hours)
- Debounced calculations prevent excessive API calls

### 5. Database Persistence
- Optional save to Supabase
- User calculation history
- Retrieve past calculations

## API Endpoints

### POST /api/roi/calculate
Calculate comprehensive ROI with Rust backend.

**Request Body:**
```json
{
  "organizationProfile": { ... },
  "operationsMetrics": { ... },
  "infrastructureData": { ... },
  "strategicFactors": { ... },
  "selectedPlan": "Professional",
  "saveToDatabase": false,
  "userId": "optional-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "calculation": {
    "annual_savings": 245000,
    "roi": 156.3,
    "payback_months": 7.8,
    ...
  }
}
```

### GET /api/roi/plans
Get available subscription plans.

**Response:**
```json
{
  "success": true,
  "plans": [
    {
      "name": "Lite",
      "monthly": 9,
      "yearly": 108,
      "features": [...],
      "limits": {...}
    },
    ...
  ]
}
```

### GET /api/roi/benchmark?industry=manufacturing
Get industry-specific benchmarks.

**Response:**
```json
{
  "success": true,
  "benchmark": {
    "industry": "manufacturing",
    "complexity": 1.3,
    "savings": 1.4,
    "risk": 1.2,
    "average_roi": 145,
    "average_payback_months": 8.5
  }
}
```

## Environment Variables

Required environment variables:

```bash
# Rust API Backend
RUST_API_URL=http://localhost:3001

# Supabase (for calculation storage)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

## Usage Example

```typescript
import { useROICalculator } from '@/hooks/use-roi-calculator'

function MyComponent() {
  const { calculate, isCalculating, error } = useROICalculator()
  
  const handleCalculate = async () => {
    const result = await calculate({
      organizationProfile: { ... },
      operationsMetrics: { ... },
      infrastructureData: { ... },
      strategicFactors: { ... },
      selectedPlan: "Professional"
    })
    
    if (result.success) {
      console.log("ROI:", result.data.roi)
    }
  }
  
  return (
    <button onClick={handleCalculate} disabled={isCalculating}>
      {isCalculating ? 'Calculating...' : 'Calculate ROI'}
    </button>
  )
}
```

## Testing

### Test Backend Connection
```bash
# Test Rust API is running
curl http://localhost:3001/health

# Test subscription plans
curl http://localhost:3000/api/roi/plans

# Test calculation
curl -X POST http://localhost:3000/api/roi/calculate \
  -H "Content-Type: application/json" \
  -d @test-data.json
```

### Test Data
See `rust-api/test-data.json` for sample calculation inputs.

## Deployment

1. **Deploy Rust Backend**
   - Use Docker: `docker-compose up -d`
   - Or deploy to serverless: Vercel, AWS Lambda, Google Cloud Run
   - Set `RUST_API_URL` environment variable

2. **Deploy Next.js Frontend**
   - Standard Vercel deployment
   - Ensure environment variables are set
   - Backend URL must be accessible from frontend

3. **Database Setup**
   - Run migrations: `cd rust-api && cargo sqlx migrate run`
   - Verify Supabase connection
   - Test calculation storage

## Monitoring

Monitor these metrics:
- API response times
- Calculation accuracy
- Error rates
- Cache hit rates
- Database query performance

## Troubleshooting

### Backend Not Responding
1. Check `RUST_API_URL` is correct
2. Verify Rust service is running
3. Check network connectivity
4. Review backend logs

### Calculations Failing
1. Check input validation errors
2. Verify Zod schema matches
3. Review backend error logs
4. Test with minimal input data

### Database Errors
1. Verify Supabase credentials
2. Check table schema matches
3. Review RLS policies
4. Test connection with psql

## Future Enhancements

- [ ] Real-time collaboration on calculations
- [ ] Export calculations to PDF/Excel
- [ ] Comparison mode (multiple scenarios)
- [ ] Advanced analytics dashboard
- [ ] Machine learning predictions
- [ ] Industry-specific templates
- [ ] Integration with CRM systems
- [ ] Mobile app with offline sync
