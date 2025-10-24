// API Configuration
const isProduction = import.meta.env.PROD;

// Use environment variables for production, otherwise use localhost
const getBaseUrl = () => {
  if (isProduction) {
    // Ensure you have VITE_API_URL set in your production environment
    return import.meta.env.VITE_API_URL || '/api';
  }
  return 'http://localhost:5000/api';
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

export default API_CONFIG;
