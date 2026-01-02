# Render Deployment Configuration

## ⚠️ CRITICAL: Port Binding Issue Fix

Render requires your app to bind to `0.0.0.0:$PORT` where `$PORT` is automatically provided by Render.

## Render Dashboard Configuration

### Build Command
```bash
pip install -r requirements.txt
```

### Start Command (USE THIS)
```bash
gunicorn workvix_project.wsgi:application --bind 0.0.0.0:$PORT --workers 4 --timeout 120 --access-logfile - --error-logfile - --log-level info
```

### Environment Variables (Set in Render Dashboard)

**Required:**
```
PYTHON_VERSION=3.13.4
DEBUG=False
SECRET_KEY=your-super-secret-production-key-change-this
ALLOWED_HOSTS=your-app-name.onrender.com
DJANGO_SETTINGS_MODULE=workvix_project.settings
```

**Database (if using PostgreSQL):**
```
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=your_database_host
DB_PORT=5432
```

**Optional:**
```
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## Important Notes

1. **DO NOT** manually set the `PORT` environment variable in Render - it's automatically provided
2. **DO NOT** hardcode any port in your code - always use `$PORT`
3. The `--bind 0.0.0.0:$PORT` in the start command ensures Render can detect your app
4. Set `DEBUG=False` in production
5. Update `ALLOWED_HOSTS` with your actual Render domain

## Testing Locally

```bash
# Set PORT in your .env file
PORT=8000

# Run with gunicorn
gunicorn workvix_project.wsgi:application --bind 0.0.0.0:8000 --reload
```

## Troubleshooting "No open ports detected"

If you see this error, ensure:
1. Your start command binds to `0.0.0.0:$PORT` (NOT localhost, NOT 127.0.0.1)
2. The `$PORT` variable is used (NOT a hardcoded number)
3. Gunicorn is actually starting (check logs)
4. No firewall is blocking the port

## Alternative Start Commands

If the above doesn't work, try:

**With migrations and static files:**
```bash
python manage.py migrate --noinput && python manage.py collectstatic --noinput && gunicorn workvix_project.wsgi:application --bind 0.0.0.0:$PORT --workers 4
```

**Using the provided start script:**
```bash
bash start.sh
```

**Using config file:**
```bash
gunicorn workvix_project.wsgi:application --config gunicorn_config.py
```
