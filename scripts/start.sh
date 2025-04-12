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

# Function to check if database is empty
check_db_empty() {
    log "Checking if database tables are empty..."
    
    # Use the Prisma query engine to check if any restaurants exist
    RESTAURANT_COUNT=$(npx prisma db execute --stdin <<SQL
    SELECT COUNT(*) as count FROM Restaurant;
SQL
    )
    
    # Extract count from result (this is a simple approach, might need adjusting)
    COUNT=$(echo "$RESTAURANT_COUNT" | grep -o '[0-9]\+' | head -1)
    debug_log "Restaurant count: $COUNT"
    
    if [ -z "$COUNT" ] || [ "$COUNT" -eq "0" ]; then
        log "Database appears to be empty, seeding required"
        return 0  # Empty database
    else
        log "Database already has data (found $COUNT restaurants)"
        return 1  # Non-empty database
    fi
}

# Function to seed the database
seed_database() {
    log "Seeding the database..."
    
    # First try using ts-node and the prisma seed command
    if command -v ts-node &> /dev/null; then
        log "Using ts-node for database seeding"
        
        # Check if bcryptjs is available
        if ! command -v node -e "require('bcryptjs')" &> /dev/null; then
            log "Installing bcryptjs locally for seeding"
            npm install --no-save bcryptjs @types/bcryptjs
        fi
        
        npx prisma db seed
        SEED_RESULT=$?
        
        if [ $SEED_RESULT -eq 0 ]; then
            return 0
        else
            log "ts-node seeding failed with code $SEED_RESULT, falling back to direct SQL seeding"
        fi
    else
        log "ts-node not available, trying alternative seeding method"
    fi
    
    # Try direct SQL seeding as fallback
    log "Seeding database with direct SQL commands"
    npx prisma db execute --stdin <<SQL
    -- Create database tables if they don't exist
    CREATE TABLE IF NOT EXISTS Restaurant (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255),
        phone VARCHAR(50),
        email VARCHAR(255),
        description TEXT
    );
    
    CREATE TABLE IF NOT EXISTS Category (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        restaurantId INT,
        FOREIGN KEY (restaurantId) REFERENCES Restaurant(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS MenuItem (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        imageUrl VARCHAR(255),
        available BOOLEAN DEFAULT true,
        categoryId INT,
        FOREIGN KEY (categoryId) REFERENCES Category(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS User (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        password VARCHAR(255) NOT NULL,
        role ENUM('USER', 'ADMIN') DEFAULT 'USER'
    );
    
    -- Insert a default restaurant if none exists
    INSERT INTO Restaurant (id, name, address, phone, email, description) 
    SELECT 1, 'Demo Restaurant', '123 Demo Street', '555-1234', 'demo@restaurant.com', 'A demo restaurant'
    WHERE NOT EXISTS (SELECT * FROM Restaurant LIMIT 1);
    
    -- Insert default categories if none exist
    INSERT INTO Category (id, name, restaurantId) 
    SELECT 1, 'Appetizers', 1
    WHERE NOT EXISTS (SELECT * FROM Category WHERE name = 'Appetizers');
    
    INSERT INTO Category (id, name, restaurantId) 
    SELECT 2, 'Main Courses', 1
    WHERE NOT EXISTS (SELECT * FROM Category WHERE name = 'Main Courses');
    
    INSERT INTO Category (id, name, restaurantId) 
    SELECT 3, 'Desserts', 1
    WHERE NOT EXISTS (SELECT * FROM Category WHERE name = 'Desserts');
    
    -- Insert sample menu items if none exist
    INSERT INTO MenuItem (name, description, price, imageUrl, available, categoryId) 
    SELECT 'Garlic Bread', 'Toasted bread with garlic butter', 5.99, '/images/garlic-bread.jpg', true, 1
    WHERE NOT EXISTS (SELECT * FROM MenuItem WHERE name = 'Garlic Bread');
    
    INSERT INTO MenuItem (name, description, price, imageUrl, available, categoryId) 
    SELECT 'Chicken Alfredo', 'Chicken with creamy alfredo sauce', 14.99, '/images/chicken-alfredo.jpg', true, 2
    WHERE NOT EXISTS (SELECT * FROM MenuItem WHERE name = 'Chicken Alfredo');
    
    INSERT INTO MenuItem (name, description, price, imageUrl, available, categoryId) 
    SELECT 'Chocolate Cake', 'Rich chocolate cake with frosting', 6.99, '/images/chocolate-cake.jpg', true, 3
    WHERE NOT EXISTS (SELECT * FROM MenuItem WHERE name = 'Chocolate Cake');
    
    -- Insert an admin user if none exists (password is 'admin123' hashed)
    INSERT INTO User (email, name, password, role)
    SELECT 'admin@restaurant.com', 'Admin User', '$2a$10$5iD2DmpGxLJ73Hcn0QVhYO6v7/8hNPVqcIFiXsOkj2CDl5/Y65EFq', 'ADMIN'
    WHERE NOT EXISTS (SELECT * FROM User WHERE email = 'admin@restaurant.com');
SQL
    SEEDING_RESULT=$?
    
    if [ $SEEDING_RESULT -eq 0 ]; then
        log "✅ Direct SQL seeding successful"
    else
        error_log "Direct SQL seeding failed with code $SEEDING_RESULT"
    fi
    return $SEEDING_RESULT
}

# Validate the environment
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

# Generate Prisma client if it doesn't exist
if [ ! -d "node_modules/.prisma/client" ]; then
    log "Generating Prisma client..."
    npx prisma generate
    if [ $? -ne 0 ]; then
        error_log "Failed to generate Prisma client but continuing..."
    fi
fi

# Check if database needs seeding and seed if empty
if check_db_empty; then
    log "Database is empty, proceeding with seeding..."
    seed_database
    SEED_RESULT=$?
    
    if [ $SEED_RESULT -eq 0 ]; then
        log "✅ Database seeded successfully."
    else
        log "⚠️ Database seeding failed with code $SEED_RESULT - continuing anyway."
    fi
else
    log "Database already contains data, skipping seeding."
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