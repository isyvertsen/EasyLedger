#!/bin/bash
set -e

echo "🚀 Starting EasyLedger production server..."

# Run Prisma migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

echo "✅ Migrations complete!"

# Start Next.js production server
echo "🌐 Starting Next.js server..."
exec npm run start:next
