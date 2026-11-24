# ---------------------------------------------------
# Stage 1: Build Environment
# ---------------------------------------------------
FROM rust:1.75-slim AS builder

# Install required build dependencies (OpenSSL is required for reqwest/sqlx)
RUN apt-get update && apt-get install -y pkg-config libssl-dev

WORKDIR /usr/src/app

# Copy the manifest files
COPY Cargo.toml Cargo.lock ./

# Copy the source code
COPY src ./src

# Create the directory first to guarantee the path exists
RUN mkdir -p .sqlx
# Copy the contents of the local .sqlx directory into the container's .sqlx directory
COPY .sqlx/ ./.sqlx/
ENV SQLX_OFFLINE=true

# Build the release binary
RUN cargo build --release

# ---------------------------------------------------
# Stage 2: Production Runtime Environment
# ---------------------------------------------------
FROM debian:bookworm-slim

# Install root certificates so the Rust backend can securely connect 
# to https://api.kronova.io and the Supabase PostgreSQL pooler
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the compiled binary from the builder stage using your exact Cargo.toml package name
COPY --from=builder /usr/src/app/target/release/kronova-roi-api /app/kronova-roi-api

# Railway injects the PORT environment variable dynamically
# Run the binary
CMD ["./kronova-roi-api"]