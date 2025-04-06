#!/bin/bash
# Restaurant Ordering System Application Startup Script for RHEL 9
# This script handles database setup and application startup

# Exit on error
set -e

echo "Starting Restaurant Ordering System..."

# Configuration
MAX_RETRIES=30
RETRY_INTERVAL=5
MYSQL_HOST=${MYSQL_HOST:-mysql}
MYSQL_PORT=${MYSQL_PORT:-3306}
MYSQL_USER=${MYSQL_USER:-restaurant_user}
MYSQL_PASSWORD=${MYSQL_PASSWORD:-restaurant_password}
MYSQL_DATABASE=${MYSQL_DATABASE:-restaurant_db}

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
for i in $(seq 1 $MAX_RETRIES); do
    if nc -z $MYSQL_HOST $MYSQL_PORT; then
        echo "✅ MySQL is ready!"
        break
    fi
    
    echo "Attempt $i/$MAX_RETRIES: MySQL is not ready yet. Waiting $RETRY_INTERVAL seconds..."
    sleep $RETRY_INTERVAL
    
    if [ $i -eq $MAX_RETRIES ]; then
        echo "❌ Error: Maximum retry attempts reached. MySQL is not available."
        exit 1
    fi
done

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Check if database needs seeding (if users table is empty)
echo "Checking if database needs seeding..."
USER_COUNT=$(npx prisma query 'SELECT COUNT(*) as count FROM User;' --json | grep -o '"count":[0-9]*' | grep -o '[0-9]*')

if [ "$USER_COUNT" = "0" ]; then
    echo "Database is empty. Seeding database..."
    npx prisma db seed
    if [ $? -eq 0 ]; then
        echo "✅ Database seeded successfully."
    else
        echo "❌ Error: Failed to seed database."
        exit 1
    fi
else
    echo "Database already contains data. Skipping seed."
fi

# Generate Prisma client if it doesn't exist
if [ ! -d "node_modules/.prisma/client" ]; then
    echo "Generating Prisma client..."
    npx prisma generate
fi

# Start the application
echo "Starting Next.js application..."
exec node server.js 