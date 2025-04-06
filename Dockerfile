FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Add build argument for npm flags
ARG NPM_FLAGS=""

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci ${NPM_FLAGS}

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install necessary tools for database management and connectivity checks
RUN apk add --no-cache curl netcat-openbsd

# Copy necessary files for Prisma
COPY --from=builder /app/prisma ./prisma/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma/
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma/

# Copy public directory and scripts
COPY --from=builder /app/public ./public
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/package.json ./package.json

# Set the correct permission for prerender cache
RUN mkdir -p .next
RUN chown nextjs:nodejs .next

# Copy the built app
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy and prepare start.sh script
COPY scripts/start.sh /app/start.sh
RUN chmod +x /app/start.sh

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Use the startup script with full path
CMD ["/app/scripts/start.sh"] 