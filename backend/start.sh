#!/bin/bash

# Exit on error
set -e

echo "Starting Django application..."
echo "PORT: 10000"

# Run migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start Gunicorn - Bind to 0.0.0.0:10000
echo "Starting Gunicorn on 0.0.0.0:10000..."
exec gunicorn workvix_project.wsgi:application \
    --bind 0.0.0.0:10000 \
    --workers 4 \
    --worker-class sync \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info
