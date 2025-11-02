export interface ApiConfig {
  baseUrl: string;
  isDocker: boolean;
  isProduction: boolean;
}

export const getApiConfig = (): ApiConfig => {
  // Check build-time environment variable first
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:17498';

  return {
    baseUrl,
    isDocker: baseUrl.includes('host.docker.internal') || baseUrl.includes('host-gateway'),
    isProduction: import.meta.env.PROD,
  };
};

export const API_BASE = getApiConfig().baseUrl;