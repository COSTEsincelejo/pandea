#!/bin/sh
set -e

if [ -z "$POSTGRES_PASSWORD" ]; then
  echo "POSTGRES_PASSWORD is required"
  exit 1
fi

export PGPASSWORD="$POSTGRES_PASSWORD"
DB_HOST=${DB_SERVER:-db}
DB_USER=${POSTGRES_USER:-postgres}
DB_NAME=${POSTGRES_DB:-pandea_db}

for i in $(seq 1 30); do
  echo "Waiting for PostgreSQL... ($i/30)"
  if psql -h "$DB_HOST" -U "$DB_USER" -d "postgres" -c '\q' >/dev/null 2>&1; then
    echo "PostgreSQL is ready."
    break
  fi
  sleep 2
  if [ "$i" -eq 30 ]; then
    echo "PostgreSQL did not become available in time."
    exit 1
  fi
 done

echo "Creating database if it does not exist..."
if ! psql -h "$DB_HOST" -U "$DB_USER" -d "postgres" -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
  psql -h "$DB_HOST" -U "$DB_USER" -d "postgres" -c "CREATE DATABASE \"$DB_NAME\""
fi

echo "Running schema import..."
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f /schema/pandea_schema.sql

echo "Database schema imported successfully."
