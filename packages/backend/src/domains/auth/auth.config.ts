/**
 * Auth Configuration Module
 * Consolidates all auth-related configuration including policies
 * Provides a single source of truth for auth system settings
 * 
 * This module combines:
 * - Policy configuration (TTLs, limits, security rules)
 * - Feature flags (enable/disable features)
 * - Integration settings (external services, callbacks)
 */

import { loadAuthPolicies, validatePolicies, type AuthPolicyConfig } from "./auth.policies.js";

/**
 * Feature flags for auth functionality
 * Allows enabling/disabling features without code changes
 */
export interface AuthFeatureFlags {
  // Enable email verification flow
  emailVerification: boolean;
  
  // Enable password reset flow
  passwordReset: boolean;
  
  // Enable multi-factor authentication
  mfa: boolean;
  
  // Enable social login (OAuth)
  socialLogin: boolean;
  
  // Enable session management UI
  sessionManagement: boolean;
  
  // Enable account recovery
  accountRecovery: boolean;
  
  // Enable audit logging
  auditLogging: boolean;
  
  // Enable security alerts (suspicious activity)
  securityAlerts: boolean;
}

/**
 * Integration settings
 * Configuration for external services and integrations
 */
export interface AuthIntegrations {
  // Email service configuration
  email?: {
    enabled: boolean;
    provider: 'smtp' | 'sendgrid' | 'ses' | 'custom';
    fromAddress: string;
  };
  
  // SMS service configuration (for MFA)
  sms?: {
    enabled: boolean;
    provider: 'twilio' | 'sns' | 'custom';
  };
  
  // Webhook URLs for events
  webhooks?: {
    enabled: boolean;
    urls: {
      onLogin?: string;
      onRegister?: string;
      onPasswordChange?: string;
      onSuspiciousActivity?: string;
    };
  };
}

/**
 * Complete auth configuration
 * Combines policies, features, and integrations
 */
export interface AuthConfig {
  // Policy configuration
  policies: AuthPolicyConfig;
  
  // Feature flags
  features: AuthFeatureFlags;
  
  // Integration settings
  integrations: AuthIntegrations;
  
  // Environment
  environment: 'development' | 'staging' | 'production';
}

/**
 * Default feature flags
 * Conservative defaults - most features disabled initially
 */
const DEFAULT_FEATURE_FLAGS: AuthFeatureFlags = {
  emailVerification: false,
  passwordReset: false,
  mfa: false,
  socialLogin: false,
  sessionManagement: true, // Enable session management by default
  accountRecovery: false,
  auditLogging: true, // Enable audit logging by default for security
  securityAlerts: false,
};

/**
 * Default integration settings
 * Minimal configuration - integrations disabled by default
 */
const DEFAULT_INTEGRATIONS: AuthIntegrations = {
  email: {
    enabled: false,
    provider: 'smtp',
    fromAddress: 'noreply@example.com',
  },
  webhooks: {
    enabled: false,
    urls: {},
  },
};

/**
 * Load complete auth configuration
 * Combines policies, features, and integrations from various sources
 * 
 * Priority order:
 * 1. Environment variables (highest priority)
 * 2. Configuration files
 * 3. Defaults (lowest priority)
 */
export function loadAuthConfig(): AuthConfig {
  // Load and validate policies
  const policies = loadAuthPolicies();
  validatePolicies(policies);
  
  // Determine environment
  const environment = (process.env.NODE_ENV as AuthConfig['environment']) || 'development';
  
  // Load feature flags (would read from env vars in production)
  const features: AuthFeatureFlags = {
    ...DEFAULT_FEATURE_FLAGS,
    // TODO: Override from environment variables
    // Example: emailVerification: process.env.AUTH_ENABLE_EMAIL_VERIFICATION === 'true'
  };
  
  // Load integration settings (would read from env vars in production)
  const integrations: AuthIntegrations = {
    ...DEFAULT_INTEGRATIONS,
    // TODO: Override from environment variables
  };
  
  return {
    policies,
    features,
    integrations,
    environment,
  };
}

/**
 * Get a specific configuration value
 * Provides type-safe access to nested config values
 */
export function getConfigValue<K extends keyof AuthConfig>(
  config: AuthConfig,
  key: K
): AuthConfig[K] {
  return config[key];
}

/**
 * Check if a feature is enabled
 * Helper function for feature flag checks
 */
export function isFeatureEnabled(
  config: AuthConfig,
  feature: keyof AuthFeatureFlags
): boolean {
  return config.features[feature];
}

/**
 * Export default configuration for convenience
 */
export const authConfig = loadAuthConfig();
