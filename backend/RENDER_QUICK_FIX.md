# Quick Start - Port Binding for Render

## TL;DR - Copy This to Render Dashboard

### Start Command:
```
bash start.sh
```

### Environment Variables:
```
DEBUG=false
SECRET_KEY=your-production-secret-key
ALLOWED_HOSTS=workvix-backend-rb7p.onrender.com
DJANGO_SETTINGS_MODULE=workvix_project.settings
```

---

## What Was Fixed

The app now properly binds to `0.0.0.0:$PORT` just like Render expects.

**Before:**
- Used `python manage.py runserver` (wrong for production)
- Didn't properly read `$PORT` environment variable
- Got "No open ports detected" error

**After:**
- Uses `gunicorn` with `--bind 0.0.0.0:$PORT`
- Reads `PORT` from environment (provided by Render)
- Properly detects and listens on the port

## Files Created/Updated

1. **start.sh** - Main startup script (recommended for Render)
2. **run.sh** - Alternative startup script
3. **render.yaml** - Render configuration file
4. **common/management/commands/start_server.py** - Django management command alternative
5. **.env** - Updated with your Render domain

## How to Deploy

1. Commit all changes:
   ```bash
   git add .
   git commit -m "Fix port binding for Render deployment"
   git push
   ```

2. Render will automatically redeploy with the new start command

3. Check logs - you should see:
   ```
   Starting Gunicorn on 0.0.0.0:XXXXX
   Listening at: http://0.0.0.0:XXXXX
   ```

✅ If you see this = PORT binding is working!
