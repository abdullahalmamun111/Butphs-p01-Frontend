/**
 * Backend-Ready REST API Client & Endpoint Contract for BUTPHS School Management System.
 *
 * By default the application runs in local institutional storage mode (`mode: 'local'`).
 * When a backend API base URL is supplied via `VITE_API_BASE_URL`, services can invoke
 * `apiClient.request()` against the exact versioned REST contract below without modifying UI code.
 */

export interface ApiMeta {
  timestamp: string;
  requestId?: string;
  page?: number;
  pageSize?: number;
  total?: number;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
  meta: ApiMeta;
}

export const API_ENDPOINTS = {
  auth: {
    login: '/api/v1/auth/login',
    logout: '/api/v1/auth/logout',
    me: '/api/v1/auth/me',
    changePassword: '/api/v1/auth/password',
  },
  profile: {
    get: '/api/v1/profile',
    update: '/api/v1/profile',
    uploadAvatar: '/api/v1/profile/avatar',
  },
  publicSite: {
    snapshot: '/api/v1/public/website-content',
    notices: '/api/v1/public/notices',
    teachers: '/api/v1/public/teachers',
    staff: '/api/v1/public/staff',
    resultsLookup: '/api/v1/public/results/lookup',
    admissionsApply: '/api/v1/public/admissions',
    inquiriesSubmit: '/api/v1/public/inquiries',
  },
  admin: {
    students: '/api/v1/students',
    teachers: '/api/v1/teachers',
    staff: '/api/v1/staff',
    guardians: '/api/v1/guardians',
    committee: '/api/v1/committee',
    notices: '/api/v1/notices',
    exams: '/api/v1/exams',
    results: '/api/v1/results',
    attendance: '/api/v1/attendance',
    rfidCards: '/api/v1/rfid/cards',
    rfidScan: '/api/v1/rfid/scan',
    smsLogs: '/api/v1/sms',
    admissions: '/api/v1/admissions',
    inquiries: '/api/v1/inquiries',
    fees: '/api/v1/finance/fees',
    transactions: '/api/v1/finance/transactions',
    websiteContent: '/api/v1/cms/website-content',
    auditLogs: '/api/v1/audit-logs',
  },
} as const;

export function getApiBaseUrl(): string {
  try {
    const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
    return (env?.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
  } catch {
    return '';
  }
}

export function buildApiUrl(endpoint: string, baseUrl: string = getApiBaseUrl()): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (!baseUrl) return cleanEndpoint;
  return `${baseUrl.replace(/\/+$/, '')}${cleanEndpoint}`;
}

export function isRemoteApiConfigured(baseUrl: string = getApiBaseUrl()): boolean {
  return baseUrl.length > 0;
}

export function createSuccessResponse<T>(data: T, extraMeta?: Partial<ApiMeta>): ApiResponse<T> {
  return {
    ok: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...extraMeta,
    },
  };
}

export function createErrorResponse<T = never>(
  code: string,
  message: string,
  details?: Record<string, string>
): ApiResponse<T> {
  return {
    ok: false,
    error: { code, message, details },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}

export const apiClient = {
  get mode(): 'remote' | 'local' {
    return isRemoteApiConfigured() ? 'remote' : 'local';
  },

  async request<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      body?: unknown;
      token?: string;
      headers?: Record<string, string>;
    } = {}
  ): Promise<ApiResponse<T>> {
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
      return createErrorResponse(
        'LOCAL_MODE',
        'Backend API URL (VITE_API_BASE_URL) is not configured; using local repository.'
      );
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      };
      if (options.token) {
        headers.Authorization = `Bearer ${options.token}`;
      }

      const response = await fetch(buildApiUrl(endpoint, baseUrl), {
        method: options.method || 'GET',
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      });

      const payload = (await response.json().catch(() => null)) as
        | { data?: T; message?: string; code?: string }
        | null;

      if (!response.ok) {
        return createErrorResponse(
          payload?.code || `HTTP_${response.status}`,
          payload?.message || `API request failed with status ${response.status}`
        );
      }

      return createSuccessResponse((payload?.data ?? (payload as unknown as T)) as T);
    } catch (err) {
      return createErrorResponse(
        'NETWORK_ERROR',
        err instanceof Error ? err.message : 'Unable to connect to backend server.'
      );
    }
  },
};
