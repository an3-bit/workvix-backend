#!/bin/bash

# This script properly binds to PORT environment variable for Render
# Similar pattern to the Express example: const port = process.env.PORT || 4000

# Get PORT from environment variable (Render provides this)
PORT=${PORT:-8000}

echo "========================================"
echo "Starting WorkVix Backend"
echo "========================================"
echo "Binding to: 0.0.0.0:$PORT"
echo "Environment: $([ "$DEBUG" = "True" ] && echo "Development" || echo "Production")"
echo "========================================"

# Run migrations
python manage.py migrate --noinput

# Collect static files
python manage.py collectstatic --noinput

# Start application bound to 0.0.0.0:$PORT
# This is the CRITICAL part for Render
gunicorn \
    workvix_project.wsgi:application \
    --bind 0.0.0.0:$PORT \
    --workers 4 \
    --timeout 120
