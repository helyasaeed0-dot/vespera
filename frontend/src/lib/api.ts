/**
 * Vespera Enterprise API Client
 * Configured for HTTP-only cookies, robust error handling, and type safety.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface FetchOptions extends RequestInit {
  data?: unknown;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
  error?: string;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { data, headers, ...customConfig } = options;

  const isFormData = data instanceof FormData;

  const defaultHeaders: Record<string, string> = {};
  if (!isFormData) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  // Attach stored access token as Authorization Bearer header if available
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("vespera_access_token");
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    method: customConfig.method || (data ? "POST" : "GET"),
    headers: {
      ...defaultHeaders,
      ...(headers as Record<string, string>),
    },
    credentials: "include", // Ensures secure HTTP-only cookies are passed
    ...customConfig,
  };

  if (data) {
    config.body = isFormData ? (data as FormData) : JSON.stringify(data);
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  try {
    const response = await fetch(url, config);
    const result = await response.json();

    if (!response.ok) {
      if (response.status === 401 && typeof window !== "undefined") {
        // Clear token on auth failure
        localStorage.removeItem("vespera_access_token");
      }
      throw new Error(result.message || `Request failed with status ${response.status}`);
    }

    // Automatically store access token if returned in auth responses
    if (typeof window !== "undefined" && result.data?.accessToken) {
      localStorage.setItem("vespera_access_token", result.data.accessToken);
    }

    return result as ApiResponse<T>;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "An unexpected network error occurred",
    };
  }
}

// Convenience helpers
export const api = {
  get: <T = any>(url: string, options?: FetchOptions) =>
    apiRequest<T>(url, { ...options, method: "GET" }),
  post: <T = any>(url: string, data?: unknown, options?: FetchOptions) =>
    apiRequest<T>(url, { ...options, method: "POST", data }),
  put: <T = any>(url: string, data?: unknown, options?: FetchOptions) =>
    apiRequest<T>(url, { ...options, method: "PUT", data }),
  patch: <T = any>(url: string, data?: unknown, options?: FetchOptions) =>
    apiRequest<T>(url, { ...options, method: "PATCH", data }),
  delete: <T = any>(url: string, options?: FetchOptions) =>
    apiRequest<T>(url, { ...options, method: "DELETE" }),
};
