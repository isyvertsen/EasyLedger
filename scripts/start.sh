#!/bin/bash
set -e

echo "🚀 Starting EasyLedger production server..."

# Run Prisma migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

echo "✅ Migrations complete!"

# Start Next.js production server using standalone mode
echo "🌐 Starting Next.js server..."
exec node .next/standalone/server.js
