# URGENT: Fix Database Migration Issue on Render

## Problem
The PostgreSQL database on Render doesn't have the required tables. Error: `relation "users" does not exist`

## Quick Fix Options

### Option 1: Run Migrations via Render Shell (RECOMMENDED)

1. Go to your Render Dashboard: https://dashboard.render.com
2. Click on your `workvix-backend` service
3. Click on the **"Shell"** tab on the left
4. Run these commands one by one:

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### Option 2: Trigger a Redeploy

1. Go to Render Dashboard
2. Click on your service
3. Click **"Manual Deploy"** → **"Clear build cache & deploy"**
4. This will run the migrations as part of the build process

### Option 3: Set Database Environment Variables Manually

If the database isn't connected, manually add these environment variables in Render Dashboard:

1. Go to your service → **Environment** tab
2. Add these variables (get values from your PostgreSQL database settings):

```
DB_NAME=tvhstays
DB_USER=tvhstays_user
DB_PASSWORD=MXtbvj3ycxkbqvJ04R1OMV8D6Emt41QA
DB_HOST=dpg-d504qbfpm1nc73c4gikg-a
DB_PORT=5432
```

3. Click **"Save Changes"** - this will trigger a redeploy

## Verify Fix

After migrations run, test the API:
```bash
curl https://workvix-backend-rb7p.onrender.com/api/users/register/ -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test1234","role":"client"}'
```

## Updated render.yaml

The `render.yaml` has been updated to:
1. Include `makemigrations` in the build command
2. Automatically link to PostgreSQL database

After fixing, commit and push changes:
```bash
git add render.yaml
git commit -m "Fix database migrations and configuration"
git push
```

This will trigger an automatic redeploy with proper migrations.
