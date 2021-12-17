#!/bin/bash

# Exit when any command fails:
set -e

# Load .env file
export $(egrep -v '^(#|RSA_PRIVATE_KEY|NEXT_PUBLIC_RSA_PUBLIC_KEY)' ./.env | xargs)

DOCKER_COMPOSE_SERVICE_NAME="db"
DOCKER_CONTAINER_NAME="app_db"

LAST_BACKUP_FILE_NAME=$(ls -p ./.backups | grep -v / | sort -V | tail -n 1)
LAST_BACKUP_FILE_PATH="./.backups/${LAST_BACKUP_FILE_NAME}"

docker-compose down -v
if [ "$NODE_ENV" = "production" ]; then
  docker-compose up -d "${DOCKER_COMPOSE_SERVICE_NAME}"
else
  docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d "${DOCKER_COMPOSE_SERVICE_NAME}"
fi
# https://stackoverflow.com/a/63011266/2736233
timeout 90s bash -c "until docker exec ${DOCKER_CONTAINER_NAME} pg_isready ; do sleep 1 ; done"

cat "${LAST_BACKUP_FILE_PATH}" \
  | docker exec -i "${DOCKER_CONTAINER_NAME}" psql -d "${POSTGRES_DB}" -U "${POSTGRES_USER}"
