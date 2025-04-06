#!/bin/bash
# Restaurant Ordering System Application Startup Script for RHEL 9
# This script handles database setup and application startup

# Create a flag file to track restart attempts in /tmp (which the nextjs user can write to)
RESTART_FLAG="/tmp/restaurant_restart_count"
if [ ! -f "$RESTART_FLAG" ]; then
    echo "0" > "$RESTART_FLAG"
fi

# Read current restart count
RESTART_COUNT=$(cat "$RESTART_FLAG")
RESTART_COUNT=$((RESTART_COUNT + 1))
echo "$RESTART_COUNT" > "$RESTART_FLAG"

# If we've restarted too many times, just start the application directly
MAX_RESTART=3
if [ "$RESTART_COUNT" -gt "$MAX_RESTART" ]; then
    echo "Maximum restart attempts reached ($RESTART_COUNT). Starting application directly..."
    exec node server.js
fi

# Exit on error
set -e

# Debug mode (set DEBUG=1 to enable)
DEBUG=${DEBUG:-0}

# Create logs directory in user's home
mkdir -p /tmp/logs

# Log file in a directory the nextjs user can write to
LOG_FILE="/tmp/logs/startup.log"

# Logging function
log() {
    local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
    local message="$timestamp - $1"
    echo "$message"
    
    # Only try to write to log file if we can
    if [ -w "$(dirname "$LOG_FILE")" ]; then
        echo "$message" >> "$LOG_FILE"
    fi
}

# Error logging function
error_log() {
    log "ERROR: $1"
    if [ "$DEBUG" -eq 1 ]; then
        log "Environment dump:"
        if [ -w "$(dirname "$LOG_FILE")" ]; then
            env | sort >> "$LOG_FILE"
        else
            log "Cannot write environment dump to log file (permission denied)"
        fi
    fi
}

# Debug logging function
debug_log() {
    if [ "$DEBUG" -eq 1 ]; then
        log "DEBUG: $1"
    fi
}

# Validate script environment
validate_environment() {
    log "Validating environment..."
    
    # Check if required commands exist
    for cmd in node npx; do
        if ! command -v $cmd &> /dev/null; then
            error_log "Required command not found: $cmd"
            return 1
        fi
    done
    
    # Check if server.js exists
    if [ ! -f "/app/server.js" ]; then
        error_log "Required file not found: /app/server.js"
        return 1
    fi
    
    debug_log "Environment validation passed"
    return 0
}

log "Starting Restaurant Ordering System..."

# Output script location for debugging
debug_log "Script running from: $(pwd)"
debug_log "Script path: $0"

# Configuration
MAX_RETRIES=30
RETRY_INTERVAL=5
MYSQL_HOST=${MYSQL_HOST:-mysql}
MYSQL_PORT=${MYSQL_PORT:-3306}
MYSQL_USER=${MYSQL_USER:-restaurant_user}
MYSQL_PASSWORD=${MYSQL_PASSWORD:-restaurant_password}
MYSQL_DATABASE=${MYSQL_DATABASE:-restaurant_db}

# Function to check if MySQL is available using multiple methods
check_mysql() {
    # Try netcat if available
    if command -v nc &> /dev/null; then
        debug_log "Checking MySQL connection with netcat"
        nc -z $MYSQL_HOST $MYSQL_PORT &> /dev/null
        return $?
    fi
    
    # Try using timeout and bash's built-in /dev/tcp (should work on most Linux systems)
    if command -v timeout &> /dev/null; then
        debug_log "Checking MySQL connection with timeout and /dev/tcp"
        timeout 1 bash -c "< /dev/tcp/$MYSQL_HOST/$MYSQL_PORT" &> /dev/null
        return $?
    fi
    
    # Fallback to using mysqladmin ping if available
    if command -v mysqladmin &> /dev/null; then
        debug_log "Checking MySQL connection with mysqladmin"
        mysqladmin ping -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASSWORD &> /dev/null
        return $?
    fi
    
    # Last resort: Try a basic telnet-style connection using bash
    debug_log "Checking MySQL connection with bash /dev/tcp fallback"
    (echo > "/dev/tcp/$MYSQL_HOST/$MYSQL_PORT") &> /dev/null
    return $?
}

# Validate the environment
if ! validate_environment; then
    error_log "Environment validation failed. Exiting."
    exit 1
fi

# Wait for MySQL to be ready
log "Waiting for MySQL to be ready..."
for i in $(seq 1 $MAX_RETRIES); do
    if check_mysql; then
        log "✅ MySQL is ready!"
        break
    fi
    
    log "Attempt $i/$MAX_RETRIES: MySQL is not ready yet. Waiting $RETRY_INTERVAL seconds..."
    sleep $RETRY_INTERVAL
    
    if [ $i -eq $MAX_RETRIES ]; then
        error_log "Maximum retry attempts reached. MySQL is not available."
        exit 1
    fi
done

# Run database migrations
log "Running database migrations..."
npx prisma migrate deploy
if [ $? -ne 0 ]; then
    error_log "Failed to run database migrations"
    exit 1
fi

# Check if ts-node is available for seeding
if ! command -v ts-node &> /dev/null; then
    log "Warning: ts-node command not found, skipping global installation (permission issue)"
    # Skip global installation as the nextjs user doesn't have permission
    # npm install -g ts-node typescript @types/node
    log "Will attempt to continue without ts-node"
fi

# Check if database needs seeding
log "Checking if database needs seeding..."

# Simple approach - try seeding but continue on failure 
log "Attempting to seed the database..."
# Use "|| true" to ensure the command doesn't fail the script
npx prisma db seed || true
SEED_RESULT=$?

if [ $SEED_RESULT -eq 0 ]; then
    log "✅ Database seeded successfully."
else
    log "Database may already have data or seeding failed with code $SEED_RESULT - continuing anyway."
fi

# Generate Prisma client if it doesn't exist
if [ ! -d "node_modules/.prisma/client" ]; then
    log "Generating Prisma client..."
    npx prisma generate
    if [ $? -ne 0 ]; then
        error_log "Failed to generate Prisma client but continuing..."
    fi
fi

# Start the application
log "Starting Next.js application..."
debug_log "Current directory content:"
if [ "$DEBUG" -eq 1 ]; then
    ls -la >> "$LOG_FILE" || true
fi

# Enable API debugging
export NEXT_PUBLIC_DEBUG_API=true 
export NEXT_DEBUG=true
export NODE_OPTIONS="--inspect=0.0.0.0:9229"

# Log available API routes for debugging
log "Available API routes:"
find ./pages/api -type f | sort >> "$LOG_FILE" || true
if [ "$DEBUG" -eq 1 ]; then
    find ./pages/api -type f | sort
    log "Node.js version: $(node -v)"
    log "NPM version: $(npm -v)"
fi

# Start the server
log "Executing: node server.js"
exec node server.js 