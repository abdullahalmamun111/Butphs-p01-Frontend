import { ENV_CONFIG } from '../config/env';

export interface ApiRequestOptions extends RequestInit {
  token?: string;
}

/**
 * Centralized REST API client abstraction.
 * Currently backed by local mock adapters when ENV_CONFIG.useMockServices is true.
 * Swap service adapters to call apiClient.get/post/put/delete when a real backend is deployed.
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = ENV_CONFIG.apiBaseUrl) {
    this.baseUrl = baseUrl;
  }

  async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {}),
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Request failed');
      throw new Error(errorText || `API Error (${response.status})`);
    }

    return (await response.json()) as T;
  }

  get<T>(endpoint: string, token?: string) {
    return this.request<T>(endpoint, { method: 'GET', token });
  }

  post<T>(endpoint: string, body: unknown, token?: string) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      token,
    });
  }

  put<T>(endpoint: string, body: unknown, token?: string) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      token,
    });
  }

  delete<T>(endpoint: string, token?: string) {
    return this.request<T>(endpoint, { method: 'DELETE', token });
  }
}

export const apiClient = new ApiClient();
