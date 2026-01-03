/**
 * Auth Policy Configuration
 * Centralizes all authentication and session policies
 * Makes the auth system configurable without code changes
 * 
 * Policy categories:
 * - Token TTLs (time-to-live)
 * - Session limits and behavior
 * - Password requirements
 * - Security thresholds
 * 
 * In production, these values should be loaded from environment variables
 * or a configuration service for easy updates without redeployment
 */

/**
 * Token time-to-live policies
 * Controls how long tokens remain valid
 */
export interface TokenPolicies {
  // Access token TTL in seconds (short-lived for security)
  accessTokenTtlSeconds: number;
  
  // Refresh token TTL in seconds (longer-lived for UX)
  refreshTokenTtlSeconds: number;
  
  // Whether to rotate refresh tokens on each use (recommended)
  rotateRefreshTokens: boolean;
}

/**
 * Session management policies
 * Controls session creation, limits, and cleanup
 */
export interface SessionPolicies {
  // Maximum concurrent sessions per user
  maxSessionsPerUser: number;
  
  // Whether to allow multiple sessions from same device
  allowMultipleSessionsPerDevice: boolean;
  
  // Session inactivity timeout in seconds (0 = no timeout)
  inactivityTimeoutSeconds: number;
  
  // How to handle exceeding max sessions: 'reject_new' or 'prune_oldest'
  sessionLimitBehavior: 'reject_new' | 'prune_oldest';
}

/**
 * Password policies
 * Enforces password security requirements
 */
export interface PasswordPolicies {
  // Minimum password length
  minLength: number;
  
  // Maximum password length
  maxLength: number;
  
  // Require at least one uppercase letter
  requireUppercase: boolean;
  
  // Require at least one lowercase letter
  requireLowercase: boolean;
  
  // Require at least one digit
  requireDigit: boolean;
  
  // Require at least one special character
  requireSpecialChar: boolean;
  
  // Password expiration in days (0 = no expiration)
  expirationDays: number;
  
  // Prevent reusing last N passwords
  preventReuseLast: number;
}

/**
 * Security policies
 * Additional security controls and thresholds
 */
export interface SecurityPolicies {
  // Maximum failed login attempts before lockout
  maxFailedLoginAttempts: number;
  
  // Lockout duration in seconds after max failed attempts
  accountLockoutDurationSeconds: number;
  
  // Enable IP-based rate limiting
  enableRateLimiting: boolean;
  
  // Enable device fingerprinting for anomaly detection
  enableDeviceFingerprinting: boolean;
  
  // Require email verification for new accounts
  requireEmailVerification: boolean;
  
  // Enable multi-factor authentication (MFA)
  enableMfa: boolean;
  
  // Require MFA for sensitive operations
  requireMfaForSensitiveOps: boolean;
}

/**
 * Complete auth policy configuration
 * Combines all policy categories
 */
export interface AuthPolicyConfig {
  tokens: TokenPolicies;
  sessions: SessionPolicies;
  passwords: PasswordPolicies;
  security: SecurityPolicies;
}

/**
 * Default policy configuration
 * Provides secure defaults suitable for most applications
 * Override specific values in production based on requirements
 */
export const DEFAULT_AUTH_POLICIES: AuthPolicyConfig = {
  tokens: {
    accessTokenTtlSeconds: 15 * 60, // 15 minutes
    refreshTokenTtlSeconds: 30 * 24 * 60 * 60, // 30 days
    rotateRefreshTokens: true,
  },
  sessions: {
    maxSessionsPerUser: 10,
    allowMultipleSessionsPerDevice: true,
    inactivityTimeoutSeconds: 0, // Disabled by default
    sessionLimitBehavior: 'prune_oldest',
  },
  passwords: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: false, // Can be enabled for stricter security
    requireLowercase: false,
    requireDigit: false,
    requireSpecialChar: false,
    expirationDays: 0, // No expiration by default
    preventReuseLast: 0, // No prevention by default
  },
  security: {
    maxFailedLoginAttempts: 5,
    accountLockoutDurationSeconds: 15 * 60, // 15 minutes
    enableRateLimiting: true,
    enableDeviceFingerprinting: false, // Can be enabled for enhanced security
    requireEmailVerification: false, // Can be enabled based on requirements
    enableMfa: false, // Can be enabled when MFA is implemented
    requireMfaForSensitiveOps: false,
  },
};

/**
 * Load auth policies from environment or configuration
 * In production, this would read from env vars, config service, etc.
 * For now, returns defaults
 */
export function loadAuthPolicies(): AuthPolicyConfig {
  // TODO: Load from environment variables or configuration service
  // Example: process.env.AUTH_ACCESS_TOKEN_TTL, etc.
  
  return DEFAULT_AUTH_POLICIES;
}

/**
 * Validate policy configuration
 * Ensures policy values are within acceptable ranges
 */
export function validatePolicies(config: AuthPolicyConfig): boolean {
  // Token TTL validations
  if (config.tokens.accessTokenTtlSeconds < 60 || config.tokens.accessTokenTtlSeconds > 3600) {
    throw new Error("Access token TTL must be between 1 minute and 1 hour");
  }
  
  if (config.tokens.refreshTokenTtlSeconds < 86400) {
    throw new Error("Refresh token TTL must be at least 1 day");
  }
  
  // Session policy validations
  if (config.sessions.maxSessionsPerUser < 1 || config.sessions.maxSessionsPerUser > 100) {
    throw new Error("Max sessions per user must be between 1 and 100");
  }
  
  // Password policy validations
  if (config.passwords.minLength < 8 || config.passwords.minLength > config.passwords.maxLength) {
    throw new Error("Invalid password length constraints");
  }
  
  // Security policy validations
  if (config.security.maxFailedLoginAttempts < 1) {
    throw new Error("Max failed login attempts must be at least 1");
  }
  
  return true;
}
