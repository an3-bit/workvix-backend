# MongoDB Configuration - Setup Complete

## Overview
Your backend is now configured to use MongoDB instead of PostgreSQL.

## Changes Made

### 1. Backend Files Updated
- **requirements.txt**: Replaced `psycopg2-binary` with `mongoengine==0.27.0` and `pymongo==4.6.0`
- **settings.py**: Updated database configuration to use MongoDB via MongoEngine
- **.env**: Added `MONGODB_URI` with your MongoDB Atlas connection string
- **render.yaml**: Updated to include the `MONGODB_URI` environment variable

### 2. Installed Packages
✅ mongoengine==0.27.0
✅ pymongo==4.6.0

## MongoDB Connection Details

**Connection String:** 
```
mongodb+srv://talaadundo:Bi01i82xRxRaklZV@workvix.kmtwbbe.mongodb.net/?retryWrites=true&w=majority&appName=workvix
```

**Database Name:** `workvix_db`

## How It Works

1. **Local Development**: If `MONGODB_URI` is not set, the app uses SQLite (`db.sqlite3`) for local testing
2. **Production (Render)**: The `MONGODB_URI` environment variable is used to connect to MongoDB Atlas

## Next Steps

### 1. Test Locally (Optional)
To test with MongoDB locally, add to your `.env`:
```
MONGODB_URI=mongodb+srv://talaadundo:Bi01i82xRxRaklZV@workvix.kmtwbbe.mongodb.net/?retryWrites=true&w=majority&appName=workvix
```

Then run:
```bash
python manage.py runserver
```

### 2. Deploy to Render
1. Commit your changes:
```bash
git add .
git commit -m "Switch database to MongoDB"
git push
```

2. Render will automatically:
   - Install new dependencies
   - Apply any migrations
   - Use the `MONGODB_URI` environment variable
   - Start the server with Gunicorn

### 3. Verify Deployment
After deployment, test the API:
```bash
curl https://workvix-backend-rb7p.onrender.com/api/users/register/ -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test1234",
    "role": "client"
  }'
```

## Important Notes

- MongoEngine provides an ORM-like interface for MongoDB
- Your Django models will still work, but data is stored in MongoDB
- SQLite fallback is still available for local development
- The database tables are no longer needed; MongoDB uses collections instead

## Troubleshooting

If you encounter issues:
1. Check that `MONGODB_URI` is correctly set in Render Environment Variables
2. Verify MongoDB Atlas allows connections from Render's IP (should be automatic)
3. Check Render logs for detailed error messages

Questions? Check the MongoEngine documentation: https://mongoengine.readthedocs.io/
