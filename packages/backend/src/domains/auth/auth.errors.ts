/**
 * Auth Error Mapping Module
 * Maps domain errors to HTTP responses with appropriate status codes
 * Provides consistent error handling across all auth endpoints
 * 
 * Security considerations:
 * - Never leak internal error details to clients
 * - Use generic messages for authentication failures
 * - Log detailed errors server-side only
 */

import { AuthError, type AuthErrorCode } from "./authService.js";

/**
 * HTTP error response structure
 */
export interface HttpErrorResponse {
  status: number;
  body: {
    error: string;
    message?: string;
  };
}

/**
 * Error code to HTTP status mapping
 * Determines the HTTP status code for each auth error
 */
const AUTH_ERROR_STATUS_MAP: Record<AuthErrorCode, number> = {
  EMAIL_ALREADY_REGISTERED: 409, // Conflict
  INVALID_CREDENTIALS: 401,      // Unauthorized
  USER_NOT_ACTIVE: 403,          // Forbidden
  USER_SUSPENDED: 403,           // Forbidden
  SESSION_NOT_FOUND: 404,        // Not Found
  SESSION_REVOKED: 401,          // Unauthorized
  SESSION_EXPIRED: 401,          // Unauthorized
  REFRESH_TOKEN_INVALID: 401,    // Unauthorized
  REFRESH_TOKEN_REUSED: 401,     // Unauthorized (security threat)
  REFRESH_TOKEN_EXPIRED: 401,    // Unauthorized
  UNKNOWN_USER: 404,             // Not Found
  PASSWORD_MISMATCH: 400,        // Bad Request
};

/**
 * User-facing error messages
 * Generic messages that don't leak system internals
 * More specific than error codes but still safe
 */
const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  EMAIL_ALREADY_REGISTERED: "This email is already registered",
  INVALID_CREDENTIALS: "Invalid email or password",
  USER_NOT_ACTIVE: "Account is not active",
  USER_SUSPENDED: "Account has been suspended",
  SESSION_NOT_FOUND: "Session not found",
  SESSION_REVOKED: "Session has been revoked",
  SESSION_EXPIRED: "Session has expired",
  REFRESH_TOKEN_INVALID: "Invalid refresh token",
  REFRESH_TOKEN_REUSED: "Token has already been used",
  REFRESH_TOKEN_EXPIRED: "Refresh token has expired",
  UNKNOWN_USER: "User not found",
  PASSWORD_MISMATCH: "Current password is incorrect",
};

/**
 * Map auth domain error to HTTP response
 * Converts AuthError to appropriate HTTP status and message
 * 
 * @param error - The error to map (AuthError or generic Error)
 * @returns HTTP error response with status code and body
 */
export function mapAuthErrorToHttp(error: unknown): HttpErrorResponse {
  // Handle AuthError instances
  if (error instanceof AuthError) {
    const status = AUTH_ERROR_STATUS_MAP[error.code] || 500;
    const message = AUTH_ERROR_MESSAGES[error.code] || "An error occurred";
    
    return {
      status,
      body: {
        error: error.code,
        message,
      },
    };
  }
  
  // Handle validation errors
  if (error instanceof Error && error.message.startsWith("validation_error:")) {
    return {
      status: 400,
      body: {
        error: "VALIDATION_ERROR",
        message: error.message.replace("validation_error: ", ""),
      },
    };
  }
  
  // Handle generic errors (should not happen in production)
  // Log these for investigation but return generic message to client
  console.error("Unexpected auth error:", error);
  
  return {
    status: 500,
    body: {
      error: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    },
  };
}

/**
 * Check if an error should trigger security alert
 * Identifies suspicious activity that should be logged/alerted
 * 
 * @param error - The error to check
 * @returns True if this error indicates suspicious activity
 */
export function isSecurityThreat(error: unknown): boolean {
  if (!(error instanceof AuthError)) {
    return false;
  }
  
  // Errors that indicate potential security threats
  const threatCodes: AuthErrorCode[] = [
    "REFRESH_TOKEN_REUSED",  // Token reuse attack
    "USER_SUSPENDED",         // Suspended account attempting access
  ];
  
  return threatCodes.includes(error.code);
}

/**
 * Get severity level for an error
 * Helps with logging and alerting prioritization
 * 
 * @param error - The error to check
 * @returns Severity level: 'low', 'medium', 'high', or 'critical'
 */
export function getErrorSeverity(error: unknown): 'low' | 'medium' | 'high' | 'critical' {
  if (!(error instanceof AuthError)) {
    return 'medium'; // Unknown errors are medium severity by default
  }
  
  // Critical severity - immediate attention required
  const criticalCodes: AuthErrorCode[] = ["REFRESH_TOKEN_REUSED"];
  if (criticalCodes.includes(error.code)) {
    return 'critical';
  }
  
  // High severity - important security events
  const highCodes: AuthErrorCode[] = ["USER_SUSPENDED"];
  if (highCodes.includes(error.code)) {
    return 'high';
  }
  
  // Medium severity - normal authentication failures
  const mediumCodes: AuthErrorCode[] = [
    "INVALID_CREDENTIALS",
    "SESSION_EXPIRED",
    "REFRESH_TOKEN_EXPIRED",
  ];
  if (mediumCodes.includes(error.code)) {
    return 'medium';
  }
  
  // Low severity - expected operational errors
  return 'low';
}
