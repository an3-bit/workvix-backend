#!/bin/bash
set -e

echo "=========================================="
echo "WORKVIX BACKEND - STARTING"
echo "=========================================="
echo "Port: 10000"
echo "Host: 0.0.0.0"
echo "Time: $(date)"
echo "=========================================="

# Step 1: Migrations
echo ""
echo "Step 1: Running database migrations..."
python manage.py migrate --noinput || {
    echo "Migration failed, but continuing..."
}

# Step 2: Static files
echo ""
echo "Step 2: Collecting static files..."
python manage.py collectstatic --noinput || {
    echo "Static files collection failed, but continuing..."
}

# Step 3: Start Gunicorn
echo ""
echo "Step 3: Starting Gunicorn..."
echo "=========================================="
echo "Binding to: 0.0.0.0:10000"
echo "=========================================="
echo ""

exec gunicorn workvix_project.wsgi:application \
    --bind 0.0.0.0:10000 \
    --workers 4 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info
