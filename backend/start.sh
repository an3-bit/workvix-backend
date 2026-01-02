#!/bin/bash

# Exit on error
set -e

echo "Starting Django application..."

# Run migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start Gunicorn
echo "Starting Gunicorn on port ${PORT:-8000}..."
exec gunicorn workvix_project.wsgi:application \
    --bind 0.0.0.0:${PORT:-8000} \
    --workers 4 \
    --timeout 30 \
    --access-logfile - \
    --error-logfile - \
    --log-level info
