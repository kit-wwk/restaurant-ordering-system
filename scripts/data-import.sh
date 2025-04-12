#!/bin/bash
# data-import.sh - Automates importing data into PM Restaurant system

# Check if a date parameter was provided
if [ -z "$1" ]; then
    echo "Usage: ./data-import.sh YYYY-MM-DD"
    echo "Please provide a date in the format YYYY-MM-DD"
    exit 1
fi

TIMESTAMP=$1

# Check if the files exist
if [ ! -f "data/categories/categories-$TIMESTAMP.json" ] && [ ! -f "data/full-backup/backup-$TIMESTAMP.sql" ]; then
    echo "No backup files found for date $TIMESTAMP"
    echo "Available backups:"
    ls -1 data/full-backup/backup-*.sql 2>/dev/null | sed 's/data\/full-backup\/backup-//' | sed 's/\.sql//'
    exit 1
fi

# Ask user which type of import to perform
echo "Select import type:"
echo "1. Import from JSON files (API-based import)"
echo "2. Import from SQL backup (direct database import)"
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo "Importing data from JSON files..."
        
        # Import restaurant profile
        if [ -f "data/restaurant/restaurant-profile-$TIMESTAMP.json" ]; then
            echo "Importing restaurant profile..."
            node clone-database.js --import-from=data/restaurant/restaurant-profile-$TIMESTAMP.json
        fi
        
        # Import categories
        if [ -f "data/categories/categories-$TIMESTAMP.json" ]; then
            echo "Importing categories..."
            node clone-database.js --import-from=data/categories/categories-$TIMESTAMP.json
        fi
        
        # Import menu items
        if [ -f "data/menu-items/menu-items-$TIMESTAMP.json" ]; then
            echo "Importing menu items..."
            node clone-database.js --import-from=data/menu-items/menu-items-$TIMESTAMP.json
        fi
        
        # Import users
        if [ -f "data/users/users-$TIMESTAMP.json" ]; then
            echo "Importing users..."
            node clone-database.js --import-from=data/users/users-$TIMESTAMP.json
        fi
        
        # Import orders
        if [ -f "data/orders/orders-$TIMESTAMP.json" ]; then
            echo "Importing orders..."
            node clone-database.js --import-from=data/orders/orders-$TIMESTAMP.json
        fi
        
        # Import bookings
        if [ -f "data/bookings/bookings-$TIMESTAMP.json" ]; then
            echo "Importing bookings..."
            node clone-database.js --import-from=data/bookings/bookings-$TIMESTAMP.json
        fi
        
        # Import promotions
        if [ -f "data/promotions/promotions-$TIMESTAMP.json" ]; then
            echo "Importing promotions..."
            node clone-database.js --import-from=data/promotions/promotions-$TIMESTAMP.json
        fi
        ;;
    2)
        if [ ! -f "data/full-backup/backup-$TIMESTAMP.sql" ]; then
            echo "No SQL backup found for date $TIMESTAMP"
            exit 1
        fi
        
        echo "Importing data from SQL backup..."
        
        # Check if running locally or in Docker
        if command -v mysql &> /dev/null; then
            # Running locally
            echo "Importing to local MySQL..."
            mysql -u root -p restaurant_db < data/full-backup/backup-$TIMESTAMP.sql
        elif command -v docker &> /dev/null; then
            # Running in Docker
            echo "Importing to Docker MySQL..."
            docker exec -i $(docker ps | grep mysql | awk '{print $1}') mysql -u root -p restaurant_db < data/full-backup/backup-$TIMESTAMP.sql
        else
            echo "Neither local MySQL nor Docker found. Cannot import SQL backup."
            exit 1
        fi
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo "Data import completed." 