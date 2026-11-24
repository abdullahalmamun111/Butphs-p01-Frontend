export const ENV_CONFIG = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  useMockServices: import.meta.env.VITE_USE_MOCK_SERVICES !== 'false',
  appName: 'Bijhari Upashi Tara Prasanna High School (BUTPHS)',
} as const;
