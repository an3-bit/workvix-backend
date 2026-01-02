/**
 * API Configuration
 * Central configuration for backend API URLs
 */

export const API_CONFIG = {
  // Base URL for the backend API
  BASE_URL: import.meta.env.VITE_API_URL || 'https://workvix-backend-rb7p.onrender.com/api',
  
  // Timeout for API requests (in milliseconds)
  TIMEOUT: 30000,
  
  // API endpoints version
  VERSION: 'v1',
} as const;

export default API_CONFIG;
