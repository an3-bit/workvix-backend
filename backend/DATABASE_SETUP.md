# PostgreSQL Database Setup - Render

## Database Credentials
```
Hostname (Internal): dpg-d504qbfpm1nc73c4gikg-a
Hostname (External): dpg-d504qbfpm1nc73c4gikg-a.oregon-postgres.render.com
Port: 5432
Database: tvhstays
Username: tvhstays_user
Password: MXtbvj3ycxkbqvJ04R1OMV8D6Emt41QA
```

## Files Updated

### 1. .env File
```
DB_NAME=tvhstays
DB_USER=tvhstays_user
DB_PASSWORD=MXtbvj3ycxkbqvJ04R1OMV8D6Emt41QA
DB_HOST=dpg-d504qbfpm1nc73c4gikg-a
DB_PORT=5432
```

### 2. settings.py
Updated to use PostgreSQL when `DB_HOST` is set in environment, otherwise falls back to SQLite.

---

## For Render Deployment

The configuration is already set up. When deployed:
- ✅ Uses internal hostname: `dpg-d504qbfpm1nc73c4gikg-a`
- ✅ All credentials from environment variables
- ✅ Uses PostgreSQL database "tvhstays"

**Make sure in Render Dashboard you set:**
```
DB_NAME=tvhstays
DB_USER=tvhstays_user
DB_PASSWORD=MXtbvj3ycxkbqvJ04R1OMV8D6Emt41QA
DB_HOST=dpg-d504qbfpm1nc73c4gikg-a
DB_PORT=5432
```

Then run migrations on deploy:
```bash
python manage.py migrate --noinput
```

---

## For Local Development

Since the internal hostname doesn't work locally, you have options:

### Option 1: Use SQLite Locally (Recommended)
Keep PostgreSQL in `.env` commented out or remove `DB_HOST`:
```bash
# Remove or comment out these lines
# DB_HOST=dpg-d504qbfpm1nc73c4gikg-a
```

Then Django will use SQLite locally.

### Option 2: Use External Hostname Locally
Update `.env` to use the external hostname:
```
DB_HOST=dpg-d504qbfpm1nc73c4gikg-a.oregon-postgres.render.com
```

This connects to the remote database from your local machine.

### Option 3: Create Local PostgreSQL
Install PostgreSQL locally and create a separate local database for development.

---

## Database Migrations

When you deploy to Render, the start script includes:
```bash
python manage.py migrate --noinput
```

This will automatically:
1. Create all necessary tables
2. Apply all pending migrations
3. Set up the schema

---

## Testing the Connection

**Test with Render (after deploy):**
Check logs in Render Dashboard - should see no database errors.

**Test Locally:**
```bash
python manage.py dbshell
```

This should show "quit" (SQLite) or "postgres=#" (PostgreSQL) depending on configuration.

---

## Important Notes

1. **Never commit credentials** - They're in `.env` which should be in `.gitignore`
2. **Internal vs External hostname**:
   - Use internal (`dpg-d504qbfpm1nc73c4gikg-a`) in Render
   - Use external for local testing
3. **Database backup** - Render provides automated daily backups
4. **Connection pooling** - For production, consider adding connection pooling (e.g., pgBouncer)

---

## Troubleshooting

**"could not translate host name to address"**
- You're trying to use the internal hostname locally
- Use SQLite or external hostname

**Connection refused**
- Check credentials in `.env` match Render database
- Ensure IP restrictions allow your connection

**Migrations fail**
- Check database user has CREATE TABLE permissions
- Ensure database exists (tvhstays)

---

## Next Steps

1. Commit changes:
   ```bash
   git add -A
   git commit -m "Configure PostgreSQL database connection"
   git push
   ```

2. In Render Dashboard, add database environment variables

3. Redeploy and check logs for successful migration

✅ All set!
