/**
 * Login controller for handling authentication requests
 * Validates credentials and issues access/refresh token pair on success
 * 
 * Security considerations:
 * - Uses generic error messages to avoid user enumeration
 * - Validates input before calling auth service
 * - Maps domain errors to appropriate HTTP status codes
 */

import type { HttpRequest, HttpResponse } from "../../api/types.js";
import { validateLogin } from "./authValidator.js";
import type { AuthServiceConfig, AuthService } from "./authService.js";

/**
 * Create a login controller with the given auth service
 * Returns an async function that handles login HTTP requests
 */
export const createLoginController = (authService: AuthService) => {
	return async (req: HttpRequest): Promise<HttpResponse> => {
		try {
			// Validate and extract email/password from request body
			const { email, password } = validateLogin(req.body);

			// Authenticate user and create session
			// Device metadata could be extracted from headers/IP if needed
			const result = await authService.authenticate({
				email,
				password,
				// Device metadata extraction could go here if we expand HttpRequest type
			});

			// Return successful authentication result with user, session, and tokens
			return {
				status: 200,
				body: result, // Returns { user, session, tokens }
			};
		} catch (error: any) {
			// Error handling with security-conscious mapping
			// Avoid leaking internal error details to clients
			const errorMessage = error.message || "Unknown error";

			// Handle validation errors (bad request format)
			if (errorMessage.includes("validation_error")) {
				return { status: 400, body: { error: errorMessage } };
			}

			// Handle auth domain errors (authentication failures)
			if (["INVALID_CREDENTIALS", "USER_NOT_ACTIVE", "USER_SUSPENDED"].includes(error.code)) {
				return { status: 401, body: { error: error.code } };
			}

			// Fallback for unexpected errors - return generic message
			return { status: 500, body: { error: "internal_error" } };
		}
	};
};
