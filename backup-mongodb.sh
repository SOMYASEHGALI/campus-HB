#!/bin/bash

# MongoDB Backup Script for CampusHB
# This script creates automated backups of your MongoDB database

# Configuration
DB_NAME="campushb"
DB_USER="campushb_user"
DB_PASSWORD="YourAppPassword123!"  # Change this to your actual password
BACKUP_DIR="/var/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/campushb_backup_$DATE"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
echo "Starting MongoDB backup..."
mongodump --db=$DB_NAME --username=$DB_USER --password=$DB_PASSWORD --authenticationDatabase=$DB_NAME --out=$BACKUP_PATH

if [ $? -eq 0 ]; then
    echo "✓ Backup completed successfully: $BACKUP_PATH"
    
    # Compress the backup
    tar -czf "$BACKUP_PATH.tar.gz" -C $BACKUP_DIR "campushb_backup_$DATE"
    rm -rf $BACKUP_PATH
    echo "✓ Backup compressed: $BACKUP_PATH.tar.gz"
    
    # Delete backups older than 7 days
    find $BACKUP_DIR -name "campushb_backup_*.tar.gz" -mtime +7 -delete
    echo "✓ Old backups cleaned up"
else
    echo "✗ Backup failed!"
    exit 1
fi

# Display backup size
BACKUP_SIZE=$(du -h "$BACKUP_PATH.tar.gz" | cut -f1)
echo "Backup size: $BACKUP_SIZE"
