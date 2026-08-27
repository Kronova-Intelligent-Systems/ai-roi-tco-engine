# Kronova ROI Calculator API

High-performance Rust backend service for the AI ROI Calculator using rspc for type-safe RPC.

## Features

- **Type-safe RPC**: Using rspc for end-to-end type safety
- **High Performance**: Built with Rust, Tokio, and Axum
- **PostgreSQL Database**: With SQLx for compile-time checked queries
- **Industry Benchmarks**: Pre-configured data for 6+ industries
- **Subscription Plans**: Configurable pricing tiers
- **Comprehensive ROI Calculations**: 16+ financial metrics and risk assessments

## Prerequisites

- Rust 1.75+
- PostgreSQL 14+
- Docker (optional)

## Installation

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install sqlx-cli
cargo install sqlx-cli --features postgres

# Clone and build
git clone <repository>
cd rust-api
cargo build --release
```

## Configuration

Create a `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost/kronova
HOST=0.0.0.0
PORT=3001
JWT_SECRET=your-secret-key
ENVIRONMENT=development
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Running

```bash
# Development
cargo run

# Production
./target/release/kronova-roi-api

# With Docker
docker build -t kronova-roi-api .
docker run -p 3001:3001 --env-file .env kronova-roi-api
```

## API Endpoints

### rspc Procedures

- **Queries**:
  - `version`: Get API version
  - `subscriptionPlans`: List all subscription plans
  - `industryBenchmark`: Get benchmark data for an industry
  - `getCalculation`: Retrieve a specific ROI calculation
  - `listCalculations`: List ROI calculations for a user

- **Mutations**:
  - `calculateROI`: Perform comprehensive ROI calculation

### REST Endpoints

- `GET /health`: Health check

## Database Migrations

```bash
# Run migrations
sqlx migrate run

# Create new migration
sqlx migrate add <migration_name>

# Revert last migration
sqlx migrate revert
```

## Testing

```bash
# Run all tests
cargo test

# Run specific test
cargo test test_name

# Run with output
cargo test -- --nocapture
```

## Deployment

### Vercel (Serverless)

```bash
vercel deploy
```

### Docker

```bash
docker build -t kronova-roi-api .
docker push your-registry/kronova-roi-api:latest
```

### Traditional Server

```bash
./build.sh
scp target/release/kronova-roi-api user@server:/app/
```

## Performance

- **Throughput**: 10,000+ req/sec on moderate hardware
- **Latency**: <5ms average for ROI calculations
- **Memory**: ~50MB baseline, efficient Rust memory management
- **Concurrency**: Tokio async runtime with connection pooling

## Architecture

```
┌─────────────────┐
│   Next.js App   │
└────────┬────────┘
         │ HTTP/JSON
┌────────▼────────┐
│  rspc Router    │ ◄── Type-safe RPC
└────────┬────────┘
         │
┌────────▼────────┐
│   Services      │
│  - ROI Calc     │
│  - Benchmarks   │
└────────┬────────┘
         │
┌────────▼────────┐
│  PostgreSQL     │
└─────────────────┘
```

## License

MIT
