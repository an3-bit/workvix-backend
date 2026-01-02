#!/bin/bash

# This script binds to port 10000 for Render

# Hardcoded port
PORT=10000

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

# Start application bound to 0.0.0.0:10000
gunicorn \
    workvix_project.wsgi:application \
    --bind 0.0.0.0:$PORT \
    --workers 4 \
    --timeout 120
