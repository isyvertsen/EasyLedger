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

# Run standalone server (static assets are at same directory level)
exec node server.js
