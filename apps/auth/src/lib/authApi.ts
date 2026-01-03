/**
 * Auth API client for making requests to backend auth endpoints
 * Wraps the HTTP client with type-safe interfaces for auth operations
 * Handles token refresh logic automatically
 */

import { httpPost, httpGet, HttpError } from "../lib/http";
import { setTokens, getRefreshToken, clearTokens } from "../lib/tokenManager";

// Type definitions for API requests and responses
export interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface Session {
  id: string;
  userId: string;
  status: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
}

export interface TokenSet {
  tokenType: string;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export interface AuthResponse {
  user: User;
  session: Session;
  tokens: TokenSet;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  issueSession?: boolean;
}

export interface LogoutRequest {
  sessionId: string;
  userId?: string;
  reason?: string;
}

export interface LogoutAllRequest {
  userId: string;
  excludeSessionId?: string;
  reason?: string;
}

/**
 * Login with email and password
 * Stores tokens on success
 */
export async function login(request: LoginRequest): Promise<AuthResponse> {
  try {
    const response = await httpPost<AuthResponse>("/auth/login", request);
    
    // Store tokens after successful login
    setTokens(response.data.tokens);
    
    return response.data;
  } catch (error) {
    // Clear any existing tokens on login failure
    clearTokens();
    throw error;
  }
}

/**
 * Register a new user account
 * Optionally issues a session (default: true)
 */
export async function register(request: RegisterRequest): Promise<AuthResponse | { user: User }> {
  try {
    const response = await httpPost<AuthResponse | { user: User }>("/auth/register", {
      ...request,
      issueSession: request.issueSession !== false, // Default to true
    });
    
    // Store tokens if session was issued
    if ("tokens" in response.data) {
      setTokens(response.data.tokens);
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Refresh the access token using the refresh token
 * Automatically updates stored tokens on success
 */
export async function refreshSession(): Promise<AuthResponse> {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }
  
  try {
    const response = await httpPost<AuthResponse>("/auth/refresh", {
      refreshToken,
    });
    
    // Update stored tokens
    setTokens(response.data.tokens);
    
    return response.data;
  } catch (error) {
    // Clear tokens on refresh failure (tokens are likely invalid)
    clearTokens();
    throw error;
  }
}

/**
 * Logout from a specific session
 * Clears local tokens if the current session is logged out
 */
export async function logout(request: LogoutRequest): Promise<void> {
  try {
    await httpPost<void>("/auth/logout", request);
  } finally {
    // Always clear local tokens on logout
    clearTokens();
  }
}

/**
 * Logout from all sessions
 * Clears local tokens
 */
export async function logoutAll(request: LogoutAllRequest): Promise<void> {
  try {
    await httpPost<void>("/auth/logout-all", request);
  } finally {
    // Always clear local tokens
    clearTokens();
  }
}

/**
 * Get list of active sessions for a user
 */
export async function getSessions(userId: string): Promise<Session[]> {
  const response = await httpGet<{ sessions: Session[] }>(`/auth/sessions?userId=${userId}`);
  return response.data.sessions;
}

/**
 * Get user-friendly error message from API error
 * Sanitizes error details for security
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    // Map specific error codes to user-friendly messages
    if (error.status === 401) {
      return "Invalid email or password";
    }
    if (error.status === 400) {
      return "Please check your input and try again";
    }
    if (error.status === 500) {
      return "Something went wrong. Please try again later";
    }
    if (error.status === 0) {
      return "Unable to connect to server. Please check your connection";
    }
  }
  
  // Generic fallback message
  return "An unexpected error occurred";
}
