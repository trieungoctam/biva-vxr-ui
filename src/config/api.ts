export interface ApiConfig {
  baseUrl: string;
  isDocker: boolean;
  isProduction: boolean;
}

const getProductionUrl = (): string => {
  // Priority: Environment variable > Fallback
  if (import.meta.env.VITE_PRODUCTION_API_URL) {
    return import.meta.env.VITE_PRODUCTION_API_URL;
  }
  // Fallback for development/testing
  return 'https://103.141.140.243:17498';
};

export const getApiConfig = (): ApiConfig => {
  // Check build-time environment variable first
  const defaultUrl = import.meta.env.PROD ? getProductionUrl() : 'http://localhost:17498';
  const baseUrl = import.meta.env.VITE_API_BASE_URL || defaultUrl;

  return {
    baseUrl,
    isDocker: baseUrl.includes('host.docker.internal') || baseUrl.includes('host-gateway'),
    isProduction: import.meta.env.PROD,
  };
};

export const resolveApiUrl = (fallbackUrl?: string): string => {
  const config = getApiConfig();
  try {
    new URL(config.baseUrl);
    return config.baseUrl;
  } catch {
    console.warn(`Invalid API URL, falling back to ${fallbackUrl || 'http://localhost:17498'}`);
    return fallbackUrl || 'http://localhost:17498';
  }
};

export const API_BASE = getApiConfig().baseUrl;