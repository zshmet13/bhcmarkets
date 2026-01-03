/**
 * Input validation schemas for auth endpoints
 * Uses Zod for type-safe runtime validation
 * Provides detailed error messages for debugging while keeping user-facing errors generic
 */

import { z } from "zod";

// Email validation schema with strict format requirements
const emailSchema = z
  .string()
  .trim()
  .email("Invalid email format")
  .toLowerCase();

// Password validation schema with minimum security requirements
// Enforces minimum length - stricter rules can be added in password policy
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must not exceed 128 characters");

// Login request schema
const loginSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"), // Less strict for login
  })
  .strict();

// Registration request schema with stricter password requirements
const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    issueSession: z.boolean().optional(),
  })
  .strict();

// Refresh token request schema
const refreshSchema = z
  .object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  })
  .strict();

// Logout request schema
const logoutSchema = z
  .object({
    sessionId: z.string().uuid("Invalid session ID format").or(z.string().min(1)),
    userId: z.string().uuid("Invalid user ID format").or(z.string().min(1)).optional(),
    reason: z.string().min(1).max(50).optional(),
  })
  .strict();

// Logout all sessions request schema
const logoutAllSchema = z
  .object({
    userId: z.string().uuid("Invalid user ID format").or(z.string().min(1)),
    excludeSessionId: z.string().uuid("Invalid session ID format").or(z.string().min(1)).optional(),
    reason: z.string().min(1).max(50).optional(),
  })
  .strict();

// Inferred TypeScript types from schemas
export type LoginBody = z.infer<typeof loginSchema>;
export type RegisterBody = z.infer<typeof registerSchema>;
export type RefreshBody = z.infer<typeof refreshSchema>;
export type LogoutBody = z.infer<typeof logoutSchema>;
export type LogoutAllBody = z.infer<typeof logoutAllSchema>;

/**
 * Helper function to throw validation errors with detailed messages
 * Prefixes error message with 'validation_error:' for consistent error handling
 */
const fail = (msg: string): never => {
  throw new Error(`validation_error: ${msg}`);
};

/**
 * Validate login request body
 * Returns validated and typed data or throws validation error
 */
export const validateLogin = (body: unknown): LoginBody => {
  const parsed = loginSchema.safeParse(body);
  if (parsed.success) return parsed.data;
  
  // Extract specific error message from Zod validation
  const errorMessage = parsed.error.issues[0]?.message || "Invalid login credentials";
  fail(errorMessage);
  return undefined as never;
};

/**
 * Validate registration request body
 * Returns validated and typed data or throws validation error
 */
export const validateRegister = (body: unknown): RegisterBody => {
  const parsed = registerSchema.safeParse(body);
  if (parsed.success) return parsed.data;
  
  // Extract specific error message from Zod validation
  const errorMessage = parsed.error.issues[0]?.message || "Invalid registration data";
  fail(errorMessage);
  return undefined as never;
};

/**
 * Validate refresh token request body
 * Returns validated and typed data or throws validation error
 */
export const validateRefresh = (body: unknown): RefreshBody => {
  const parsed = refreshSchema.safeParse(body);
  if (parsed.success) return parsed.data;
  
  const errorMessage = parsed.error.issues[0]?.message || "Invalid refresh token";
  fail(errorMessage);
  return undefined as never;
};

/**
 * Validate logout request body
 * Returns validated and typed data or throws validation error
 */
export const validateLogout = (body: unknown): LogoutBody => {
  const parsed = logoutSchema.safeParse(body);
  if (parsed.success) return parsed.data;
  
  const errorMessage = parsed.error.issues[0]?.message || "Invalid logout request";
  fail(errorMessage);
  return undefined as never;
};

/**
 * Validate logout all sessions request body
 * Returns validated and typed data or throws validation error
 */
export const validateLogoutAll = (body: unknown): LogoutAllBody => {
  const parsed = logoutAllSchema.safeParse(body);
  if (parsed.success) return parsed.data;
  
  const errorMessage = parsed.error.issues[0]?.message || "Invalid logout all request";
  fail(errorMessage);
  return undefined as never;
};
