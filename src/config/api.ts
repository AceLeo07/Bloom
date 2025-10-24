// API Configuration - No environment variables needed
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
} as const;

export default API_CONFIG;
