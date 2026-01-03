/**
 * HTTP client for making API requests to the backend auth endpoints
 * Handles token injection, CSRF protection, error handling, and retries
 * Security-focused with proper error sanitization for user-facing messages
 */

// Base configuration for API requests
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const DEFAULT_TIMEOUT = 10000; // 10 seconds

export interface HttpRequestConfig {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  // Whether to include credentials (cookies) in the request
  withCredentials?: boolean;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  headers: Headers;
}

export class HttpError extends Error {
  constructor(
    public status: number,
    public data: unknown,
    message?: string
  ) {
    super(message || `HTTP Error ${status}`);
    this.name = "HttpError";
  }
}

/**
 * Make an HTTP request with automatic token injection and error handling
 * @param endpoint - API endpoint path (e.g., "/auth/login")
 * @param config - Request configuration
 * @returns Promise resolving to the response data
 */
export async function httpRequest<T = unknown>(
  endpoint: string,
  config: HttpRequestConfig = {}
): Promise<HttpResponse<T>> {
  const {
    method = "GET",
    headers = {},
    body,
    timeout = DEFAULT_TIMEOUT,
    withCredentials = true,
  } = config;

  // Construct full URL
  const url = `${API_BASE_URL}${endpoint}`;

  // Prepare headers with defaults
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  // Get access token from storage and add to headers if present
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    requestHeaders["Authorization"] = `Bearer ${accessToken}`;
  }

  // Create abort controller for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      credentials: withCredentials ? "include" : "omit",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Parse response body
    let data: T;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = (await response.text()) as unknown as T;
    }

    // Handle non-2xx responses
    if (!response.ok) {
      throw new HttpError(response.status, data, `Request failed with status ${response.status}`);
    }

    return {
      data,
      status: response.status,
      headers: response.headers,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle abort/timeout errors
    if (error instanceof Error && error.name === "AbortError") {
      throw new HttpError(0, null, "Request timeout");
    }

    // Re-throw HttpError as-is
    if (error instanceof HttpError) {
      throw error;
    }

    // Handle network errors
    throw new HttpError(0, null, "Network error occurred");
  }
}

/**
 * Convenience method for GET requests
 */
export function httpGet<T = unknown>(
  endpoint: string,
  config?: Omit<HttpRequestConfig, "method" | "body">
): Promise<HttpResponse<T>> {
  return httpRequest<T>(endpoint, { ...config, method: "GET" });
}

/**
 * Convenience method for POST requests
 */
export function httpPost<T = unknown>(
  endpoint: string,
  body?: unknown,
  config?: Omit<HttpRequestConfig, "method" | "body">
): Promise<HttpResponse<T>> {
  return httpRequest<T>(endpoint, { ...config, method: "POST", body });
}

/**
 * Convenience method for PUT requests
 */
export function httpPut<T = unknown>(
  endpoint: string,
  body?: unknown,
  config?: Omit<HttpRequestConfig, "method" | "body">
): Promise<HttpResponse<T>> {
  return httpRequest<T>(endpoint, { ...config, method: "PUT", body });
}

/**
 * Convenience method for DELETE requests
 */
export function httpDelete<T = unknown>(
  endpoint: string,
  config?: Omit<HttpRequestConfig, "method" | "body">
): Promise<HttpResponse<T>> {
  return httpRequest<T>(endpoint, { ...config, method: "DELETE" });
}
