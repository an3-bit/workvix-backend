#!/usr/bin/env python
"""
Simple WSGI server runner for Render deployment.
Explicitly binds to 0.0.0.0:10000
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

if __name__ == "__main__":
    # Set up Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'workvix_project.settings')
    
    # Run migrations
    print("=" * 60)
    print("STARTING WORKVIX BACKEND ON PORT 10000")
    print("=" * 60)
    print("\n1. Running database migrations...")
    execute_from_command_line(['manage.py', 'migrate', '--noinput'])
    
    print("\n2. Collecting static files...")
    execute_from_command_line(['manage.py', 'collectstatic', '--noinput'])
    
    print("\n3. Starting Gunicorn on 0.0.0.0:10000...")
    print("=" * 60 + "\n")
    
    # Start Gunicorn
    os.execvp('gunicorn', [
        'gunicorn',
        'workvix_project.wsgi:application',
        '--bind', '0.0.0.0:10000',
        '--workers', '4',
        '--timeout', '120',
        '--access-logfile', '-',
        '--error-logfile', '-',
        '--log-level', 'info',
    ])
