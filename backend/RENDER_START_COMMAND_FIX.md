# ✅ FINAL FIX - Render Start Command Issue

## Problem
Render is still running `python manage.py runserver` instead of your production start script.

## Solution
You MUST update the **Start Command** in Render Dashboard manually:

### Step 1: Go to Render Dashboard
1. Navigate to your backend service: `workvix-backend-rb7p`
2. Click on **"Settings"** tab
3. Find **"Start Command"** field

### Step 2: Replace with This Command
```
gunicorn workvix_project.wsgi:application --bind 0.0.0.0:10000 --workers 4 --timeout 120 --access-logfile - --error-logfile -
```

### Step 3: Save and Deploy
1. Click **"Save"**
2. Render will automatically redeploy
3. Watch the logs - you should see:
   ```
   Listening at: http://0.0.0.0:10000
   ```

---

## Alternative Options (Pick ONE)

### Option A: Using Bash Script
**Start Command:**
```
bash start.sh
```

### Option B: Using Python Server Runner
**Start Command:**
```
python server.py
```

### Option C: Using Django Management Command
**Start Command:**
```
python manage.py start_server
```

### Option D: Direct Gunicorn (Recommended)
**Start Command:**
```
gunicorn workvix_project.wsgi:application --bind 0.0.0.0:10000 --workers 4 --timeout 120 --access-logfile - --error-logfile -
```

---

## Files Created/Updated

1. **Procfile** - Tells Render what command to run
2. **render.yaml** - Full configuration file (if using)
3. **start.sh** - Bash startup script
4. **server.py** - Python startup script
5. **gunicorn_config.py** - Gunicorn configuration

---

## Why This Happens

Render tries to auto-detect the start command if you don't specify one. It sees Django and defaults to `python manage.py runserver`, which:
- ❌ Doesn't bind to the port properly
- ❌ Is for development only
- ❌ Can't be reached from the internet

You MUST explicitly tell Render to use Gunicorn.

---

## Expected Log Output After Fix

```
=> Build successful 🎉
=> Running 'gunicorn workvix_project.wsgi:application --bind 0.0.0.0:10000 ...'
[2026-01-02 06:05:00 +0000] [1234] [INFO] Starting gunicorn 23.0.0
[2026-01-02 06:05:00 +0000] [1234] [INFO] Listening at: http://0.0.0.0:10000 (1234)
[2026-01-02 06:05:00 +0000] [1234] [INFO] Using worker: sync
[2026-01-02 06:05:00 +0000] [1235] [INFO] Booting worker with pid: 1235
```

✅ If you see "Listening at: http://0.0.0.0:10000" = SUCCESS!

---

## Quick Checklist

- [ ] Commit your changes: `git add -A && git commit -m "Fix Render start command" && git push`
- [ ] Go to Render Dashboard
- [ ] Find the **Start Command** field
- [ ] Paste one of the commands above (Option D is simplest)
- [ ] Click Save
- [ ] Wait for redeploy (2-3 minutes)
- [ ] Check logs for "Listening at: http://0.0.0.0:10000"
- [ ] Test the API: `https://workvix-backend-rb7p.onrender.com/api/`

---

## Still Not Working?

If you still see "No open ports detected":

1. **Check the logs** - What command is actually running?
2. **Restart the service** - Use Render's "Restart Instance" button
3. **Clear the build cache** - Use "Clear Build Cache" then redeploy
4. **Use the simplest command** - Try Option D first

If absolutely stuck, contact Render support and show them this error with screenshot of your Start Command setting.
