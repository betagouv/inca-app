#!/bin/bash

# Exit when any command fails:
set -e

# Load .env file
if [ -f "./.env" ]; then
  export $(egrep -v '^(#|EDDSA_PRIVATE_KEY|NEXT_PUBLIC_EDDSA_PUBLIC_KEY)' ./.env | xargs) > /dev/null
fi

DOCKER_CONTAINER_NAME="app_db"

BACKUP_FILE_PATH="./.backups/$(date '+%Y-%m-%d').sql"

if [ ! -d ./.backups ]; then
  echo "Creating directory './.backups'…"
  mkdir ./.backups
fi

echo "Dumping databases in '${BACKUP_FILE_PATH}'…"
docker exec -t "${DOCKER_CONTAINER_NAME}" pg_dumpall -c -U "${POSTGRES_USER}" > "${BACKUP_FILE_PATH}"
