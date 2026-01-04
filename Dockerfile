# Stage 1: Dependencies
FROM node:24-alpine AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Stage 2: Builder
FROM node:24-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

# Copy application code
COPY . .

# Set environment variables for build
# Note: Clerk keys must be valid format even during build
# These will be replaced with real values at runtime
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmsuZXhhbXBsZS5jb20k
ENV CLERK_SECRET_KEY=sk_test_1234567890abcdefghijklmnopqrstuvwxyz
ENV DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy

# Build Next.js application with static generation disabled
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy all necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/scripts ./scripts

# Change ownership to nextjs user
RUN chown -R nextjs:nodejs /app

# Switch to nextjs user
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use the start script that runs migrations
CMD ["sh", "scripts/start.sh"]
