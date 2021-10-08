#!/bin/bash

# Exit when any command fails
set -e

echo "Building survey_app Docker container..."
sudo docker-compose build app

echo "Stopping existing Docker containers..."
docker-compose down

echo "Starting app Docker containers..."
docker-compose up -d app
