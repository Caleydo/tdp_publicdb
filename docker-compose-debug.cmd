@echo off
shift
docker compose -f docker-compose.yml -f docker-compose-debug.yml %*
