#!/bin/bash

# Build script for Rust API

set -e

echo "Building Kronova ROI Calculator API..."

# Check if cargo is installed
if ! command -v cargo &> /dev/null; then
    echo "Error: Rust/Cargo is not installed"
    exit 1
fi

# Clean previous builds
cargo clean

# Run tests
echo "Running tests..."
cargo test

# Build for release
echo "Building release binary..."
cargo build --release

# Run database migrations
echo "Running database migrations..."
if [ -n "$DATABASE_URL" ]; then
    sqlx migrate run
else
    echo "Warning: DATABASE_URL not set, skipping migrations"
fi

echo "Build completed successfully!"
echo "Binary location: target/release/kronova-roi-api"
