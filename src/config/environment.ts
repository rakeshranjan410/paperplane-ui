/**
 * Environment Configuration
 * 
 * Automatically determines API URL and other settings based on HOST_ENV
 * 
 * Environments:
 * - local: Development on localhost
 * - production: AWS EC2 deployment
 */

type HostEnvironment = 'local' | 'production';

interface EnvironmentConfig {
  apiUrl: string;
  environment: HostEnvironment;
  isProduction: boolean;
}

// Get HOST_ENV from environment variables
const HOST_ENV = (import.meta.env.VITE_HOST_ENV || 'local') as HostEnvironment;

// Environment-specific configurations
const configs: Record<HostEnvironment, EnvironmentConfig> = {
  local: {
    apiUrl: 'http://localhost:4000',
    environment: 'local',
    isProduction: false,
  },
  production: {
    apiUrl: import.meta.env.VITE_API_URL_PROD || 'http://13.210.218.219:4000',
    environment: 'production',
    isProduction: true,
  },
};

// Get current configuration
export const config: EnvironmentConfig = configs[HOST_ENV] || configs.local;

// Export individual values for convenience
export const API_BASE_URL = config.apiUrl;
export const ENVIRONMENT = config.environment;
export const IS_PRODUCTION = config.isProduction;

// Debug log in development
if (!IS_PRODUCTION) {
  console.log('🔧 Environment Configuration:', {
    HOST_ENV,
    API_BASE_URL,
    ENVIRONMENT,
    IS_PRODUCTION,
  });
}

// Helper to get environment status
export function getEnvironmentInfo() {
  return {
    environment: ENVIRONMENT,
    apiUrl: API_BASE_URL,
    isProduction: IS_PRODUCTION,
    hostEnv: HOST_ENV,
  };
}
