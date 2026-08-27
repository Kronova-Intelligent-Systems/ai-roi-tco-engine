# ROI Calculator Deployment Guide

## Database Setup

The ROI Calculator uses Supabase with proper authentication integration via `auth.uid()`.

### Running Migrations

Execute the following SQL scripts in order:

1. **scripts/014_roi_calculator_tables.sql** - Creates core tables (profiles, roi_calculations, roi_calc_comparable_plans, industry_benchmarks)
2. **scripts/015_seed_roi_comparable_plans.sql** - Seeds competitor AI SaaS subscription plans

### Key Tables

#### profiles
- Extends `auth.users` with additional user information
- Uses `auth.uid()` as primary key (UUID reference to `auth.users(id)`)
- RLS policies ensure users can only access their own profile

#### roi_calculations
- Stores historical ROI calculation data
- Links to users via `user_id UUID REFERENCES auth.users(id)`
- RLS policies ensure users can only view/edit their own calculations

#### roi_calc_comparable_plans
- Contains Kronova plans and competitor AI SaaS plans
- Public read access for all users (anonymous and authenticated)
- Includes OpenAI, Anthropic, Google AI, Azure, Hugging Face, Cohere, Midjourney, Jasper AI, Copy.ai, Stability AI, and Grammarly

#### industry_benchmarks
- Industry-specific ROI benchmarks and metrics
- Public read access for all users

### Row Level Security (RLS)

All tables have RLS enabled with the following policies:

- **profiles**: Users can view/update only their own profile
- **roi_calculations**: Users can CRUD only their own calculations
- **roi_calc_comparable_plans**: Public read access to active plans
- **industry_benchmarks**: Public read access

### Environment Variables

Required for production:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Frontend Integration

The ROI calculator automatically:
1. Falls back to client-side calculations when backend is unavailable
2. Uses mock data for development/preview environments
3. Displays subscription plans from hardcoded data as primary source
4. Optionally fetches plans from Supabase when configured

### Testing

1. Run migrations in Supabase SQL Editor
2. Verify tables are created with: `SELECT * FROM public.roi_calc_comparable_plans LIMIT 10;`
3. Test RLS policies by querying as different users
4. Verify ROI calculator displays plans correctly in preview

### Deployment Checklist

- [ ] Run migration scripts 014 and 015
- [ ] Verify all tables exist with proper indexes
- [ ] Test RLS policies
- [ ] Configure environment variables in Vercel
- [ ] Test ROI calculator functionality
- [ ] Verify plan selection and price display
- [ ] Test calculation results with various inputs

## Architecture

- **Frontend**: Next.js with React hooks for state management
- **Backend**: Rust/rspc API (optional, with TypeScript fallback)
- **Database**: Supabase PostgreSQL with RLS
- **Caching**: SWR for client-side data fetching
- **Fallback**: Automatic client-side calculations when API unavailable
