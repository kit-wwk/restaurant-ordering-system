#!/bin/bash
set -e

# Restaurant Ordering System - Database Backup Script for RHEL 9
# This script creates a backup of the MySQL database and stores it locally
# Schedule this with cron to run regularly

# Configuration
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_DIR="/home/$(whoami)/backups"
CONTAINER_NAME="restaurant_mysql"
DB_NAME="restaurant_db"
DB_USER="restaurant_user"
DB_PASSWORD="restaurant_password"
BACKUP_RETENTION_DAYS=7

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "🔄 Starting database backup at $(date)"

# Create the backup
echo "📦 Creating backup..."
# Check which docker command style to use
if command -v docker-compose &> /dev/null; then
  # Using standalone docker-compose
  docker exec $CONTAINER_NAME /usr/bin/mysqldump --single-transaction --quick --lock-tables=false \
    -u $DB_USER -p$DB_PASSWORD $DB_NAME | gzip > $BACKUP_DIR/backup-$TIMESTAMP.sql.gz
else
  # Using docker compose plugin (RHEL 9 default)
  docker exec $CONTAINER_NAME /usr/bin/mysqldump --single-transaction --quick --lock-tables=false \
    -u $DB_USER -p$DB_PASSWORD $DB_NAME | gzip > $BACKUP_DIR/backup-$TIMESTAMP.sql.gz
fi

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "✅ Backup completed successfully: $BACKUP_DIR/backup-$TIMESTAMP.sql.gz"
  
  # Calculate backup size
  BACKUP_SIZE=$(du -h $BACKUP_DIR/backup-$TIMESTAMP.sql.gz | awk '{print $1}')
  echo "📊 Backup size: $BACKUP_SIZE"
  
  # Remove old backups
  echo "🧹 Removing backups older than $BACKUP_RETENTION_DAYS days..."
  find $BACKUP_DIR -name "backup-*.sql.gz" -type f -mtime +$BACKUP_RETENTION_DAYS -delete
else
  echo "❌ Backup failed"
  exit 1
fi

# Optional: Upload to S3 or other cloud storage
# Uncomment and configure the following line to enable S3 upload
# Install AWS CLI if needed: sudo dnf install -y awscli
# aws s3 cp $BACKUP_DIR/backup-$TIMESTAMP.sql.gz s3://your-bucket-name/database-backups/

echo "🏁 Backup process completed at $(date)" 