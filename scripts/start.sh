#!/bin/bash
# Restaurant Ordering System Application Startup Script for RHEL 9
# This script handles database setup and application startup

# Exit on error
set -e

# Debug mode (set DEBUG=1 to enable)
DEBUG=${DEBUG:-0}

# Log file
LOG_FILE="/app/startup.log"

# Logging function
log() {
    local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
    local message="$timestamp - $1"
    echo "$message"
    echo "$message" >> "$LOG_FILE"
}

# Error logging function
error_log() {
    log "ERROR: $1"
    if [ "$DEBUG" -eq 1 ]; then
        log "Environment dump:"
        env | sort >> "$LOG_FILE"
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

# Check if database needs seeding (if users table is empty)
log "Checking if database needs seeding..."
USER_COUNT=$(npx prisma query 'SELECT COUNT(*) as count FROM User;' --json | grep -o '"count":[0-9]*' | grep -o '[0-9]*')

if [ "$USER_COUNT" = "0" ]; then
    log "Database is empty. Seeding database..."
    npx prisma db seed
    if [ $? -eq 0 ]; then
        log "✅ Database seeded successfully."
    else
        error_log "Failed to seed database."
        exit 1
    fi
else
    log "Database already contains data. Skipping seed."
fi

# Generate Prisma client if it doesn't exist
if [ ! -d "node_modules/.prisma/client" ]; then
    log "Generating Prisma client..."
    npx prisma generate
    if [ $? -ne 0 ]; then
        error_log "Failed to generate Prisma client"
        exit 1
    fi
fi

# Start the application
log "Starting Next.js application..."
debug_log "Current directory content:"
if [ "$DEBUG" -eq 1 ]; then
    ls -la >> "$LOG_FILE"
fi

# Start the server
log "Executing: node server.js"
exec node server.js 