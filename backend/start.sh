#!/bin/bash

# Exit on error
set -e

echo "Starting Django application..."
echo "PORT: ${PORT:-8000}"

# Run migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start Gunicorn - CRITICAL: Bind to 0.0.0.0:$PORT for Render
echo "Starting Gunicorn on 0.0.0.0:${PORT:-8000}..."
exec gunicorn workvix_project.wsgi:application \
    --bind 0.0.0.0:${PORT:-8000} \
    --workers 4 \
    --worker-class sync \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info
