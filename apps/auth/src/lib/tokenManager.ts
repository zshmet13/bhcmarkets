/**
 * Token manager for handling access and refresh tokens
 * Provides centralized token storage, retrieval, and validation
 * Security-focused: avoids logging tokens, implements safe storage patterns
 */

import { getItem, setItem, removeItem } from "./storage";

// Token storage keys (prefixed to avoid collisions)
const ACCESS_TOKEN_KEY = "auth.accessToken";
const REFRESH_TOKEN_KEY = "auth.refreshToken";
const ACCESS_TOKEN_EXPIRES_KEY = "auth.accessTokenExpiresAt";
const REFRESH_TOKEN_EXPIRES_KEY = "auth.refreshTokenExpiresAt";
const TOKEN_TYPE_KEY = "auth.tokenType";

export interface TokenSet {
  tokenType: string;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

/**
 * Store a complete token set in local storage
 * Called after successful login or token refresh
 */
export function setTokens(tokens: TokenSet): void {
  setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  setItem(ACCESS_TOKEN_EXPIRES_KEY, tokens.accessTokenExpiresAt);
  setItem(REFRESH_TOKEN_EXPIRES_KEY, tokens.refreshTokenExpiresAt);
  setItem(TOKEN_TYPE_KEY, tokens.tokenType);
}

/**
 * Retrieve the current access token from storage
 * Returns null if token doesn't exist or is expired
 */
export function getAccessToken(): string | null {
  const token = getItem(ACCESS_TOKEN_KEY);
  const expiresAt = getItem(ACCESS_TOKEN_EXPIRES_KEY);
  
  // Return null if token doesn't exist
  if (!token || !expiresAt) {
    return null;
  }
  
  // Check if token is expired (with 30 second buffer)
  const expiryTime = new Date(expiresAt).getTime();
  const currentTime = Date.now();
  const bufferMs = 30 * 1000; // 30 seconds
  
  if (currentTime >= expiryTime - bufferMs) {
    // Token is expired or about to expire
    return null;
  }
  
  return token;
}

/**
 * Retrieve the current refresh token from storage
 * Returns null if token doesn't exist or is expired
 */
export function getRefreshToken(): string | null {
  const token = getItem(REFRESH_TOKEN_KEY);
  const expiresAt = getItem(REFRESH_TOKEN_EXPIRES_KEY);
  
  if (!token || !expiresAt) {
    return null;
  }
  
  // Check if refresh token is expired
  const expiryTime = new Date(expiresAt).getTime();
  const currentTime = Date.now();
  
  if (currentTime >= expiryTime) {
    // Refresh token is expired
    return null;
  }
  
  return token;
}

/**
 * Get the complete token set from storage
 * Returns null if tokens are missing or invalid
 */
export function getTokens(): TokenSet | null {
  const accessToken = getItem(ACCESS_TOKEN_KEY);
  const refreshToken = getItem(REFRESH_TOKEN_KEY);
  const accessTokenExpiresAt = getItem(ACCESS_TOKEN_EXPIRES_KEY);
  const refreshTokenExpiresAt = getItem(REFRESH_TOKEN_EXPIRES_KEY);
  const tokenType = getItem(TOKEN_TYPE_KEY);
  
  // All token fields must be present
  if (!accessToken || !refreshToken || !accessTokenExpiresAt || !refreshTokenExpiresAt || !tokenType) {
    return null;
  }
  
  return {
    tokenType,
    accessToken,
    accessTokenExpiresAt,
    refreshToken,
    refreshTokenExpiresAt,
  };
}

/**
 * Clear all stored tokens
 * Called on logout or when tokens are invalid
 */
export function clearTokens(): void {
  removeItem(ACCESS_TOKEN_KEY);
  removeItem(REFRESH_TOKEN_KEY);
  removeItem(ACCESS_TOKEN_EXPIRES_KEY);
  removeItem(REFRESH_TOKEN_EXPIRES_KEY);
  removeItem(TOKEN_TYPE_KEY);
}

/**
 * Check if the user has valid tokens (at least a refresh token)
 * Used to determine if user is authenticated
 */
export function hasValidTokens(): boolean {
  const refreshToken = getRefreshToken();
  return refreshToken !== null;
}

/**
 * Check if the access token needs to be refreshed
 * Returns true if access token is expired but refresh token is still valid
 */
export function shouldRefreshToken(): boolean {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  
  // Should refresh if access token is expired/missing but refresh token is valid
  return !accessToken && refreshToken !== null;
}
