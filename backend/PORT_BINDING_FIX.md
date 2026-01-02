# Port Binding Fix for Render

## The Problem
Render requires applications to bind to `0.0.0.0:$PORT` where `$PORT` is provided by Render's environment.

## The Solution

We've implemented **multiple ways** to properly bind to the PORT variable:

### Option 1: Using start.sh (Recommended for render.yaml)
```bash
bash start.sh
```

This script:
- Reads `PORT` environment variable (defaults to 8000)
- Explicitly binds to `0.0.0.0:$PORT` 
- Runs migrations and collectstatic
- Starts Gunicorn with proper settings

**Start Command in Render Dashboard:**
```
bash start.sh
```

### Option 2: Using run.sh (Alternative)
```bash
bash run.sh
```

Similar to Option 1, but with simpler output.

**Start Command in Render Dashboard:**
```
bash run.sh
```

### Option 3: Direct Gunicorn Command
```bash
gunicorn workvix_project.wsgi:application --bind 0.0.0.0:$PORT --workers 4
```

**Start Command in Render Dashboard:**
```
gunicorn workvix_project.wsgi:application --bind 0.0.0.0:$PORT --workers 4 --timeout 120 --access-logfile - --error-logfile -
```

### Option 4: Using Django Management Command
```bash
python manage.py start_server
```

**Start Command in Render Dashboard:**
```
python manage.py start_server
```

---

## Critical Requirements

✅ **Must bind to:** `0.0.0.0:$PORT` (NOT localhost, NOT 127.0.0.1)
✅ **Must read PORT from:** `$PORT` environment variable
✅ **Must not hardcode:** Any port number

## How It Works

The pattern is similar to the Express example Render provides:

```bash
# JavaScript (Express)
const port = process.env.PORT || 4000
app.listen(port, ...)

# Bash (Our Solution)
PORT=${PORT:-8000}  # Use PORT env var, default to 8000
gunicorn --bind 0.0.0.0:$PORT ...  # Bind to that port
```

## Render Dashboard Configuration

### Using render.yaml (Recommended)
Simply push `render.yaml` to your repo - Render will use it automatically.

### Manual Configuration
1. Go to your Render service
2. Click "Environment"
3. Set these variables:
   ```
   DEBUG=false
   SECRET_KEY=<your-secret-key>
   ALLOWED_HOSTS=workvix-backend-rb7p.onrender.com
   DJANGO_SETTINGS_MODULE=workvix_project.settings
   ```
4. Go to "Settings"
5. Set **Start Command** to one of the options above

## Verification

After deploying, you should see in the logs:

```
Starting Django application...
PORT: 10000

Running database migrations...
Collecting static files...
Starting Gunicorn on 0.0.0.0:10000...
[2026-01-02 ...] Starting gunicorn 23.0.0
[2026-01-02 ...] Listening at: http://0.0.0.0:10000
```

✅ If you see "Listening at: http://0.0.0.0:<PORT>" - it's working!
❌ If you see "No open ports detected" - the PORT binding is wrong

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No open ports detected | Use `0.0.0.0` not `127.0.0.1` or `localhost` |
| ALLOWED_HOSTS error | Add your Render domain to ALLOWED_HOSTS env var |
| Migration errors | Check logs - DB credentials might be missing |
| Connection refused | Ensure PORT is used from environment, not hardcoded |

## Testing Locally

```bash
# Set PORT environment variable
export PORT=8000

# Run one of the scripts
bash start.sh

# Or run Gunicorn directly
gunicorn workvix_project.wsgi:application --bind 0.0.0.0:8000
```

Visit: http://localhost:8000
