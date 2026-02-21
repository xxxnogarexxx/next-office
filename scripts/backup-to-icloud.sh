#!/bin/bash
# Backup next-office to iCloud hourly
# Excludes node_modules, .next, and other build artifacts

BACKUP_DIR="$HOME/Library/Mobile Documents/com~apple~CloudDocs/claude-config/backups/next-office"
SOURCE_DIR="$HOME/Library/Mobile Documents/com~apple~CloudDocs/projects/next-office"

mkdir -p "$BACKUP_DIR"

rsync -a --delete \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude '.env.local' \
  "$SOURCE_DIR/" "$BACKUP_DIR/"

echo "$(date): Backup completed" >> /tmp/nextoffice-backup.log
