#!/bin/bash
set -e

echo "🚀 Starting EasyLedger production server..."

# Run Prisma migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

echo "✅ Migrations complete!"

# Start Next.js production server using standalone mode
echo "🌐 Starting Next.js server on 0.0.0.0:3000..."

# Ensure server listens on all interfaces for Docker/Coolify
export PORT=3000
export HOSTNAME="0.0.0.0"

# CRITICAL: Must run from .next/standalone directory for static assets to work
cd .next/standalone
exec node server.js
