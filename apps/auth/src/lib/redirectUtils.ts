/**
 * Redirect utilities for safe post-authentication navigation
 * Prevents open redirect vulnerabilities by validating redirect URLs
 * Centralizes redirect logic for consistency across the auth app
 */

// Allowed redirect hosts (whitelist for security)
// In production, this should come from environment configuration
const ALLOWED_HOSTS = [
  "localhost",
  "127.0.0.1",
  // Add production domains here
];

// Default redirect path after successful login
const DEFAULT_POST_LOGIN_PATH = "/dashboard";

// Storage key for return URL
const RETURN_URL_KEY = "auth.returnUrl";

/**
 * Check if a URL is safe to redirect to
 * Prevents open redirect attacks by validating against allowed hosts
 */
export function isSafeRedirectUrl(url: string): boolean {
  try {
    // Parse the URL
    const parsedUrl = new URL(url, window.location.origin);
    
    // Check if it's a relative path (same origin)
    if (parsedUrl.origin === window.location.origin) {
      return true;
    }
    
    // Check if the host is in the allowed list
    return ALLOWED_HOSTS.includes(parsedUrl.hostname);
  } catch {
    // Invalid URL format
    return false;
  }
}

/**
 * Store the return URL for post-authentication redirect
 * Only stores if the URL is safe
 */
export function setReturnUrl(url: string): void {
  if (isSafeRedirectUrl(url)) {
    try {
      sessionStorage.setItem(RETURN_URL_KEY, url);
    } catch (error) {
      console.error("Failed to store return URL:", error);
    }
  }
}

/**
 * Get and clear the stored return URL
 * Returns null if no URL is stored or if it's not safe
 */
export function getAndClearReturnUrl(): string | null {
  try {
    const url = sessionStorage.getItem(RETURN_URL_KEY);
    if (url && isSafeRedirectUrl(url)) {
      sessionStorage.removeItem(RETURN_URL_KEY);
      return url;
    }
  } catch (error) {
    console.error("Failed to retrieve return URL:", error);
  }
  return null;
}

/**
 * Get the post-login redirect URL
 * Checks for stored return URL first, then falls back to default
 */
export function getPostLoginRedirect(): string {
  const returnUrl = getAndClearReturnUrl();
  return returnUrl || DEFAULT_POST_LOGIN_PATH;
}

/**
 * Redirect to the post-login page
 * Uses safe redirect logic with fallback
 */
export function redirectAfterLogin(): void {
  const redirectUrl = getPostLoginRedirect();
  window.location.href = redirectUrl;
}

/**
 * Redirect to the login page with optional return URL
 * Stores the current location as return URL if not provided
 */
export function redirectToLogin(returnUrl?: string): void {
  const urlToStore = returnUrl || window.location.pathname + window.location.search;
  setReturnUrl(urlToStore);
  window.location.href = "/login";
}

/**
 * Redirect to a specific path (safe redirect)
 * Only redirects if the path is safe
 */
export function safeRedirect(path: string): void {
  if (isSafeRedirectUrl(path)) {
    window.location.href = path;
  } else {
    // If unsafe, redirect to default
    window.location.href = DEFAULT_POST_LOGIN_PATH;
  }
}
