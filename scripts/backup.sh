#!/bin/bash
set -e

# Restaurant Ordering System - Database Backup Script for RHEL 9
# This script creates a backup of the MySQL database and stores it locally
# Schedule this with cron to run regularly

# Configuration
BACKUP_DIR="/home/$(whoami)/database_backups"
BACKUP_RETENTION_DAYS=7
DB_USER="restaurant_user"
DB_PASSWORD="restaurant_password"
DB_NAME="restaurant_db"
MYSQL_CONTAINER="mysql"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"
echo "Backup directory: $BACKUP_DIR"

# Determine which Docker Compose command to use
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    echo "Error: Docker Compose not found."
    echo "Please install Docker Compose and try again."
    exit 1
fi

echo "Using Docker Compose command: $DOCKER_COMPOSE"

# Check if the MySQL container is running
if ! $DOCKER_COMPOSE ps | grep -q "$MYSQL_CONTAINER.*Up"; then
    echo "Error: MySQL container is not running."
    echo "Please start the containers using: $DOCKER_COMPOSE up -d"
    exit 1
fi

echo "Creating database backup..."

# Create database backup
$DOCKER_COMPOSE exec -T $MYSQL_CONTAINER mysqldump -u$DB_USER -p$DB_PASSWORD $DB_NAME | gzip > "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ] && [ -f "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "✅ Backup created successfully: $BACKUP_FILE ($BACKUP_SIZE)"
else
    echo "❌ Error: Backup failed."
    exit 1
fi

# Remove backups older than retention period
echo "Removing backups older than $BACKUP_RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "backup_*.sql.gz" -type f -mtime +$BACKUP_RETENTION_DAYS -delete

echo "Backup process completed."

# Optional: Upload backup to S3 or other remote storage
# If you need to upload to S3, install the AWS CLI and configure it:
# sudo dnf install -y awscli
# aws configure
# Then uncomment the following lines:
#
# echo "Uploading backup to S3..."
# aws s3 cp "$BACKUP_FILE" "s3://your-bucket-name/backups/"
#
# if [ $? -eq 0 ]; then
#     echo "✅ Backup uploaded to S3 successfully."
# else
#     echo "❌ Error: Failed to upload backup to S3."
#     exit 1
# fi 