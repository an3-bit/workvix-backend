"""Gunicorn configuration file for production deployment"""
import os

# Server socket - Hardcoded to port 10000 for Render
port = 10000
bind = f"0.0.0.0:{port}"
backlog = 2048

print(f"\n{'='*50}")
print(f"GUNICORN BINDING TO: 0.0.0.0:{port}")
print(f"{'='*50}\n")

# Worker processes
workers = 4
worker_class = 'sync'
worker_connections = 1000
timeout = 30
keepalive = 2

# Logging
accesslog = '-'
errorlog = '-'
loglevel = 'info'

# Process naming
proc_name = 'workvix'

# Server mechanics
daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None

# SSL (if needed)
# keyfile = None
# certfile = None
