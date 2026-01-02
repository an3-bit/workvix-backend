# Render Deployment - CRITICAL FIXES

## Problems Fixed

1. ✅ **App was using development server** (`python manage.py runserver`) instead of Gunicorn
2. ✅ **ALLOWED_HOSTS didn't include Render domain** causing 400 Bad Request errors
3. ✅ **No port binding** - Render couldn't detect open ports

## Changes Made

### 1. Updated [settings.py](workvix_project/settings.py)
Added wildcard support for Render domains:
```python
_allowed_hosts = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=lambda v: [s.strip() for s in v.split(',')])
ALLOWED_HOSTS = _allowed_hosts + ['*.onrender.com', 'onrender.com']
```

### 2. Updated [.env](../.env)
Added your Render domain:
```
ALLOWED_HOSTS=localhost,127.0.0.1,workvix-backend-rb7p.onrender.com
```

### 3. Created [render.yaml](render.yaml)
Configuration file for Render deployment (optional but recommended)

## Render Dashboard Configuration

If you're not using `render.yaml`, configure these in the Render dashboard:

### Start Command
```bash
gunicorn workvix_project.wsgi:application --bind 0.0.0.0:$PORT --workers 4 --timeout 120 --access-logfile - --error-logfile -
```

**Do NOT use:** `python manage.py runserver`

### Environment Variables

```
DEBUG=False
SECRET_KEY=your-super-secret-key-here
ALLOWED_HOSTS=workvix-backend-rb7p.onrender.com
DJANGO_SETTINGS_MODULE=workvix_project.settings
PYTHON_VERSION=3.13.4
```

## What This Fixes

1. **Port Detection**: Now properly binds to `0.0.0.0:$PORT` so Render can detect it
2. **ALLOWED_HOSTS Error**: Domain is now whitelisted in two ways:
   - Via environment variable config
   - Via wildcard `*.onrender.com` in settings.py
3. **Development vs Production**: Using Gunicorn instead of `runserver` for proper production serving

## Next Steps

1. Commit and push your changes to trigger a new deployment
2. Render should detect the port on startup
3. You should no longer see "No open ports detected" or ALLOWED_HOSTS errors

## Troubleshooting

If you still see issues:

1. **Check Render logs** - Make sure start command is running
2. **Verify DEBUG=False** in production
3. **Confirm ALLOWED_HOSTS** includes your domain
4. **Check SECRET_KEY** is set securely
5. **Restart** the service from Render dashboard

## For Frontend

Update your API calls to use:
```
https://workvix-backend-rb7p.onrender.com/api/
```

Or use an environment variable for flexibility.
