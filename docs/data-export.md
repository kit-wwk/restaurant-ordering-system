# Data Export and Import Guide

This guide explains how to export and import data from the PM Restaurant system.

## Data Export Folder Structure

All exported data should be organized in the `data` folder with the following structure:

```
data/
├── restaurant/
│   └── restaurant-profile.json
├── categories/
│   └── categories-YYYY-MM-DD.json
├── menu-items/
│   └── menu-items-YYYY-MM-DD.json
├── users/
│   └── users-YYYY-MM-DD.json
├── orders/
│   └── orders-YYYY-MM-DD.json
├── bookings/
│   └── bookings-YYYY-MM-DD.json
├── promotions/
│   └── promotions-YYYY-MM-DD.json
└── full-backup/
    └── backup-YYYY-MM-DD.sql
```

## Creating the Data Directory Structure

```bash
# Create the main data directory
mkdir -p data

# Create subdirectories for each data type
mkdir -p data/restaurant
mkdir -p data/categories
mkdir -p data/menu-items
mkdir -p data/users
mkdir -p data/orders
mkdir -p data/bookings
mkdir -p data/promotions
mkdir -p data/full-backup
```

## Exporting Data Using API Scripts

The PM Restaurant system includes scripts for exporting data via API calls.

### Using export-categories.js

This script exports menu categories to JSON files:

```bash
# Run the export script
node export-categories.js

# Move the exported file to its proper location
mv backup-categories-*.json data/categories/
```

### Using clone-database.js

This script exports all data models:

```bash
# Run the database clone script in export mode
node clone-database.js

# Move the exported files to their proper locations
mv backup-restaurant-profile-*.json data/restaurant/
mv backup-categories-*.json data/categories/
mv backup-menu-items-*.json data/menu-items/
mv backup-users-*.json data/users/
mv backup-orders-*.json data/orders/
mv backup-bookings-*.json data/bookings/
mv backup-promotions-*.json data/promotions/
```

### Exporting Data Using Direct Database Access

For a complete database backup, you can export directly from MySQL:

```bash
# For local MySQL
mysqldump -u root -p restaurant_db > data/full-backup/backup-$(date +%Y-%m-%d).sql

# For Docker-based MySQL
docker exec -it mysql mysqldump -u root -p restaurant_db > data/full-backup/backup-$(date +%Y-%m-%d).sql
```

## Data Export Automation Script

Create a script to automate the data export process:

```bash
#!/bin/bash
# data-export.sh

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
    docker exec -it mysql mysqldump -u root -p restaurant_db > data/full-backup/backup-$TIMESTAMP.sql 2>/dev/null || echo "Docker MySQL backup failed"
else
    echo "Neither local MySQL nor Docker found. Skipping full database backup."
fi

echo "Data export completed. Files are organized in the data directory."
```

Save this script as `scripts/data-export.sh` and make it executable:

```bash
chmod +x scripts/data-export.sh
```

## Importing Data

### Importing from JSON Files

```bash
# Import categories
node clone-database.js --import-from=data/categories/categories-YYYY-MM-DD.json

# Import menu items
node clone-database.js --import-from=data/menu-items/menu-items-YYYY-MM-DD.json

# Import other data types similarly
```

### Importing from SQL Backup

```bash
# For local MySQL
mysql -u root -p restaurant_db < data/full-backup/backup-YYYY-MM-DD.sql

# For Docker-based MySQL
docker exec -i mysql mysql -u root -p restaurant_db < data/full-backup/backup-YYYY-MM-DD.sql
```

## Data Import Automation Script

Create a script to automate the data import process:

```bash
#!/bin/bash
# data-import.sh

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
            docker exec -i mysql mysql -u root -p restaurant_db < data/full-backup/backup-$TIMESTAMP.sql
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
```

Save this script as `scripts/data-import.sh` and make it executable:

```bash
chmod +x scripts/data-import.sh
```

## Scheduling Regular Data Exports

To schedule regular data exports, set up a cron job:

```bash
# Edit crontab
crontab -e

# Add a job to run every day at 2 AM
0 2 * * * /path/to/scripts/data-export.sh >> /path/to/logs/data-export.log 2>&1
```

## Data Retention Policy

Consider implementing a data retention policy to manage the storage space:

```bash
# Add to data-export.sh or create a separate cleanup script

# Keep only the last 7 daily backups
find data/full-backup -name "backup-*.sql" -type f -mtime +7 -delete

# Keep only the last 30 days of JSON exports
find data/categories -name "categories-*.json" -type f -mtime +30 -delete
find data/menu-items -name "menu-items-*.json" -type f -mtime +30 -delete
# Repeat for other data types
```

## Best Practices

1. **Regular Exports**: Schedule regular exports to prevent data loss
2. **Multiple Formats**: Export both JSON and SQL formats for flexibility
3. **Off-site Backups**: Copy backups to a different location or cloud storage
4. **Validation**: Regularly check the integrity of exported data
5. **Documentation**: Keep notes of when exports were made and what they contain
