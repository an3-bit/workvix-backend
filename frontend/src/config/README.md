# API Configuration

This directory contains API configuration files for the WorkVix frontend.

## Files

- **api.config.ts**: Central configuration file for API settings including base URL, timeout, and version.

## Environment Variables

The application uses environment variables to configure the backend API URL:

### `.env` file

Create a `.env` file in the `frontend` root directory with:

```env
VITE_API_URL=https://workvix-backend-rb7p.onrender.com/api
```

### Development vs Production

- **Production (Deployed Backend)**: 
  ```env
  VITE_API_URL=https://workvix-backend-rb7p.onrender.com/api
  ```

- **Local Development**: 
  ```env
  VITE_API_URL=http://127.0.0.1:8000/api
  ```

## Usage

The API configuration is automatically imported in `src/api/client.ts` and used throughout the application. No additional setup is required after setting the environment variable.

## Switching Environments

To switch between local and deployed backend:

1. Open `frontend/.env`
2. Change `VITE_API_URL` to the desired backend URL
3. Restart the development server (`npm run dev`)

**Note**: Changes to `.env` files require restarting the Vite development server to take effect.
