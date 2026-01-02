#!/bin/bash
# Script to run database migrations on Render PostgreSQL

echo "=========================================="
echo "Running Database Migrations"
echo "=========================================="

# Run migrations
python manage.py makemigrations
python manage.py migrate --noinput

# Create superuser if needed (optional)
# python manage.py createsuperuser --noinput --email admin@workvix.com || true

# Create initial data if script exists
if [ -f "create_initial_data.py" ]; then
    echo "Creating initial data..."
    python create_initial_data.py || true
fi

echo "=========================================="
echo "Migrations Complete!"
echo "=========================================="
