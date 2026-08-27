# Deployment Guide - Kronova AI ROI Calculator

This guide covers deploying the full-stack AI ROI Calculator with Next.js frontend and Rust/rspc backend.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
- [Backend Deployment (Rust API)](#backend-deployment-rust-api)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Progressive Web App (PWA)](#progressive-web-app-pwa)
- [Mobile App Stores](#mobile-app-stores)
- [Monitoring and Debugging](#monitoring-and-debugging)

## Architecture Overview

The application consists of:

1. **Next.js Frontend** - React-based UI with server actions
2. **Rust/rspc Backend** - High-performance API for ROI calculations
3. **PostgreSQL Database** - Data persistence (via Supabase or Neon)
4. **PWA** - Offline-capable progressive web app
5. **Mobile Apps** - iOS and Android native apps

### Fallback System

The application includes intelligent fallback:
- **Primary**: Rust backend API for calculations
- **Fallback**: Client-side TypeScript calculations when API unavailable
- **Mock Data**: Development/preview environments

## Prerequisites

- Node.js 18+ and pnpm
- Rust 1.70+ and Cargo
- PostgreSQL database (Supabase or Neon)
- Vercel account for frontend hosting
- Docker for containerized Rust deployment

## Frontend Deployment (Vercel)

### 1. Deploy to Vercel

```bash
# Install Vercel CLI
pnpm install -g vercel

# Deploy
vercel --prod
```

### 2. Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```env
# Required
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=your-resend-key

# Optional (for Rust backend integration)
RUST_API_URL=https://your-rust-api.com
USE_MOCK_DATA=false
```

### 3. Custom Domain

1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Configure DNS records as shown

## Backend Deployment (Rust API)

### Option 1: Docker Deployment

#### Build Docker Image

```bash
cd rust-api
docker build -t kronova-roi-api .
```

#### Run Container

```bash
docker run -d \
  -p 3001:3001 \
  -e DATABASE_URL="postgresql://..." \
  -e RUST_LOG=info \
  --name roi-api \
  kronova-roi-api
```

### Option 2: Fly.io Deployment

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Navigate to rust-api directory
cd rust-api

# Launch app
fly launch --name kronova-roi-api

# Set secrets
fly secrets set DATABASE_URL="postgresql://..."

# Deploy
fly deploy
```

### Option 3: AWS Lambda (Serverless)

See `rust-api/README.md` for AWS Lambda deployment instructions using Cargo Lambda.

### Option 4: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

## Database Setup

### Using Supabase

1. **Create Project**
   - Go to https://supabase.com
   - Create new project
   - Note your project URL and keys

2. **Run Migrations**

```bash
# From project root
cd scripts
pnpm tsx run-migrations.ts
```

Or manually execute SQL scripts in Supabase SQL Editor:
- `scripts/001_create_roi_tables.sql`
- `scripts/002_seed_data.sql`

### Using Neon

1. **Create Database**
   - Go to https://neon.tech
   - Create new database
   - Copy connection string

2. **Run Migrations**

```bash
cd rust-api
cargo install sqlx-cli
sqlx migrate run
```

## Environment Configuration

### Development

```env
USE_MOCK_DATA=true
RUST_API_URL=http://localhost:3001
NODE_ENV=development
```

### Preview/Staging

```env
USE_MOCK_DATA=false
RUST_API_URL=https://staging-api.your-domain.com
NODE_ENV=production
```

### Production

```env
USE_MOCK_DATA=false
RUST_API_URL=https://api.your-domain.com
NODE_ENV=production
```

## Progressive Web App (PWA)

### Configuration

The PWA is automatically configured. Ensure these files are present:

- `public/manifest.json` - App manifest
- `public/service-worker.js` - Service worker
- `public/icons/*` - App icons

### Testing PWA

1. **Chrome DevTools**
   - Open DevTools → Application → Manifest
   - Check "Service Workers"
   - Verify offline functionality

2. **Lighthouse Audit**
   ```bash
   pnpm lighthouse https://your-domain.com --view
   ```

### PWA Deployment Checklist

- ✅ HTTPS enabled
- ✅ Valid manifest.json
- ✅ Service worker registered
- ✅ Icons (192x192, 512x512)
- ✅ Offline page configured
- ✅ Meta tags in layout.tsx

## Mobile App Stores

### iOS App Store

See `docs/IOS_DEPLOYMENT.md` for detailed instructions.

**Quick Start:**

```bash
cd ios
fastlane beta  # TestFlight
fastlane release  # App Store
```

### Android Google Play

See `docs/ANDROID_DEPLOYMENT.md` for detailed instructions.

**Quick Start:**

```bash
cd android
fastlane beta  # Internal testing
fastlane production  # Production release
```

## Monitoring and Debugging

### Rust API Monitoring

```bash
# View logs
docker logs -f roi-api

# Or with Fly.io
fly logs

# Health check
curl https://your-rust-api.com/health
```

### Frontend Monitoring

1. **Vercel Analytics** - Automatic performance monitoring
2. **Vercel Logs** - Runtime logs in dashboard
3. **Custom Logging**
   ```typescript
   console.log("[v0] Debug message")
   ```

### Database Monitoring

- **Supabase**: Dashboard → Database → Query Performance
- **Neon**: Dashboard → Metrics

### Error Tracking

Add Sentry integration:

```bash
pnpm add @sentry/nextjs
```

Configure in `sentry.client.config.ts`.

## Troubleshooting

### Frontend Issues

**Issue**: "Failed to fetch subscription plans"
- **Solution**: Set `USE_MOCK_DATA=true` or ensure Rust API is running

**Issue**: Build fails with webpack errors
- **Solution**: Clear `.next` cache and rebuild
  ```bash
  rm -rf .next
  pnpm build
  ```

### Backend Issues

**Issue**: Rust API connection refused
- **Check**: Is the service running? `docker ps`
- **Check**: Firewall/security group rules
- **Check**: Environment variables set correctly

**Issue**: Database connection failed
- **Check**: DATABASE_URL is correct
- **Check**: Database allows connections from your IP
- **Check**: Credentials are valid

### PWA Issues

**Issue**: Service worker not registering
- **Check**: HTTPS is enabled
- **Check**: Valid manifest.json
- **Solution**: Clear cache and hard reload

## Performance Optimization

### Frontend

- Enable Edge Runtime for API routes
- Use ISR for static pages
- Optimize images with Next.js Image
- Enable compression

### Backend

- Enable connection pooling
- Add Redis caching
- Use Rust release builds
- Configure CORS properly

### Database

- Add indexes on frequently queried columns
- Use connection pooling
- Enable query caching
- Regular VACUUM operations

## Security Checklist

- ✅ Environment variables secured
- ✅ HTTPS enabled everywhere
- ✅ CORS configured properly
- ✅ Rate limiting enabled
- ✅ SQL injection protection (parameterized queries)
- ✅ Authentication tokens secured
- ✅ Regular dependency updates
- ✅ Security headers configured

## Backup and Recovery

### Database Backups

**Supabase**: Automatic daily backups
**Neon**: Point-in-time recovery

Manual backup:
```bash
pg_dump $DATABASE_URL > backup.sql
```

### Application Backup

Code is backed up in GitHub. Ensure:
- Regular commits
- Tagged releases
- Branch protection rules

## Scaling

### Horizontal Scaling

- **Frontend**: Vercel auto-scales
- **Backend**: Add more Rust API instances behind load balancer
- **Database**: Use read replicas

### Vertical Scaling

- Upgrade Vercel plan for more resources
- Increase Docker container resources
- Upgrade database plan

## Support

For issues:
1. Check logs (Vercel, Docker, Database)
2. Review error messages
3. Consult documentation
4. Open GitHub issue

---

**Last Updated**: January 2026
**Version**: 1.0.0
