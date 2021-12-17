#!/bin/bash

# Exit when any command fails:
set -e

# Load .env file
export $(egrep -v '^(#|RSA_PRIVATE_KEY|NEXT_PUBLIC_RSA_PUBLIC_KEY)' ./.env | xargs)

DOCKER_COMPOSE_SERVICE_NAME="db"
DOCKER_CONTAINER_NAME="app_db"

BACKUP_FILE_PATH="./.backups/$(date '+%Y-%m-%d').sql"

if [ ! -d ./.backups ]; then
  mkdir ./.backups
fi

docker exec -t "${DOCKER_CONTAINER_NAME}" pg_dumpall -c -U "${POSTGRES_USER}" > "${BACKUP_FILE_PATH}"
