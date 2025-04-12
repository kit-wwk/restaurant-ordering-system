#!/bin/bash
# data-export.sh - Automates exporting data from PM Restaurant system

# Set timestamp
TIMESTAMP=$(date +%Y-%m-%d)

# Create directory structure if it doesn't exist
mkdir -p data/{restaurant,categories,menu-items,users,orders,bookings,promotions,full-backup}

# Export data using clone-database.js
echo "Exporting data via API..."
node clone-database.js

# Move files to appropriate directories
echo "Organizing exported files..."
mv backup-restaurant-profile-*.json data/restaurant/restaurant-profile-$TIMESTAMP.json 2>/dev/null || echo "No restaurant profile data exported"
mv backup-categories-*.json data/categories/categories-$TIMESTAMP.json 2>/dev/null || echo "No category data exported"
mv backup-menu-items-*.json data/menu-items/menu-items-$TIMESTAMP.json 2>/dev/null || echo "No menu item data exported"
mv backup-users-*.json data/users/users-$TIMESTAMP.json 2>/dev/null || echo "No user data exported"
mv backup-orders-*.json data/orders/orders-$TIMESTAMP.json 2>/dev/null || echo "No order data exported"
mv backup-bookings-*.json data/bookings/bookings-$TIMESTAMP.json 2>/dev/null || echo "No booking data exported"
mv backup-promotions-*.json data/promotions/promotions-$TIMESTAMP.json 2>/dev/null || echo "No promotion data exported"

# Create full database backup if MySQL is available
echo "Creating full database backup..."
if command -v mysql &> /dev/null; then
    # Check if running locally
    mysqldump -u root -p restaurant_db > data/full-backup/backup-$TIMESTAMP.sql 2>/dev/null || echo "Local MySQL backup failed"
elif command -v docker &> /dev/null; then
    # Check if running in Docker
    docker exec -it $(docker ps | grep mysql | awk '{print $1}') mysqldump -u root -p restaurant_db > data/full-backup/backup-$TIMESTAMP.sql 2>/dev/null || echo "Docker MySQL backup failed"
else
    echo "Neither local MySQL nor Docker found. Skipping full database backup."
fi

# Apply data retention policy
echo "Applying data retention policy..."

# Keep only the last 7 daily backups
find data/full-backup -name "backup-*.sql" -type f -mtime +7 -delete

# Keep only the last 30 days of JSON exports
find data/categories -name "categories-*.json" -type f -mtime +30 -delete
find data/menu-items -name "menu-items-*.json" -type f -mtime +30 -delete
find data/users -name "users-*.json" -type f -mtime +30 -delete
find data/orders -name "orders-*.json" -type f -mtime +30 -delete
find data/bookings -name "bookings-*.json" -type f -mtime +30 -delete
find data/promotions -name "promotions-*.json" -type f -mtime +30 -delete
find data/restaurant -name "restaurant-profile-*.json" -type f -mtime +30 -delete

echo "Data export completed. Files are organized in the data directory." 