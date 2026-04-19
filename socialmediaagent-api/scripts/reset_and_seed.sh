#!/bin/bash
set -e

echo "=== Database Reset & Seed ==="
echo "This will DROP all tables and recreate everything."

# Navigate to project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Find the Docker container name or ID
CONTAINER=$(docker ps --format '{{.Names}}' | grep -i postgres | head -1)
if [ -z "$CONTAINER" ]; then
    CONTAINER=$(docker ps --format '{{.ID}}' | head -1)
fi

# Drop all tables using Docker PostgreSQL
echo "Dropping all tables..."
docker exec -i "$CONTAINER" psql -U postgres -d socialmediaagent -c "
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
"
echo "All tables dropped."

# Activate virtual environment and run migrations
echo "Running migrations..."
source .venv/bin/activate
alembic upgrade head

# Seed demo data
echo "Seeding demo data..."
python scripts/seed_demo_data.py

echo "=== Done! ==="
echo "Database has been reset and seeded with demo data."
echo "Login with: owner@demo.example / start@123"