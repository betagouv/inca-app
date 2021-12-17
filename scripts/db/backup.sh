#!/bin/bash

# Exit when any command fails:
set -e

# Load .env file
export $(egrep -v '^(#|RSA_PRIVATE_KEY|NEXT_PUBLIC_RSA_PUBLIC_KEY)' ./.env | xargs)

DOCKER_COMPOSE_SERVICE_NAME="db"
DOCKER_CONTAINER_NAME="app_db"

printf -v BACKUP_FILE_NAME '%(%Y-%m-%d)T\n' -1
BACKUP_PATH="./.backups/$(date '+%Y-%m-%d').sql"

if [ ! -d ./.backups ]; then
  mkdir ./.backups
fi

# https://stackoverflow.com/a/63011266/2736233
timeout 90s bash -c "until docker exec ${DOCKER_CONTAINER_NAME} pg_isready ; do sleep 1 ; done"

docker exec -t "${DOCKER_CONTAINER_NAME}" pg_dumpall -c -U "${POSTGRES_USER}" > "${BACKUP_PATH}"
