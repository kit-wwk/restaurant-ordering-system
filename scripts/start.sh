#!/bin/sh
set -e

echo "🚀 Starting restaurant ordering system..."

# Wait for the database to be ready
echo "⏳ Waiting for MySQL to be ready..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if nc -z mysql 3306; then
    echo "✅ MySQL is ready!"
    break
  fi
  
  RETRY_COUNT=$((RETRY_COUNT+1))
  echo "MySQL not ready yet (attempt $RETRY_COUNT/$MAX_RETRIES)... waiting 5 seconds..."
  sleep 5
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "❌ Failed to connect to MySQL after $MAX_RETRIES attempts"
  exit 1
fi

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Seed the database (only if it's empty)
echo "🌱 Checking if database needs seeding..."
USERS_COUNT=$(npx prisma query 'SELECT COUNT(*) as count FROM User' --json | grep -o '"count":[0-9]*' | cut -d':' -f2)

if [ "$USERS_COUNT" = "0" ]; then
  echo "🌱 Seeding the database..."
  npx prisma db seed
else
  echo "🔍 Database already has data, skipping seed"
fi

# Generate Prisma client if needed
if [ ! -d "node_modules/.prisma/client" ]; then
  echo "🔨 Generating Prisma client..."
  npx prisma generate
fi

# Start the Next.js application
echo "🚀 Starting Next.js application..."
exec node server.js 