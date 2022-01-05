#!/bin/bash

# Exit when any command fails
set -e

echo "Backing up database..."
sudo make backup

echo "Building survey_app Docker container..."
sudo docker-compose build app

echo "Stopping existing Docker containers..."
docker-compose down

echo "Starting app_db & app_app Docker containers..."
docker-compose up -d app
