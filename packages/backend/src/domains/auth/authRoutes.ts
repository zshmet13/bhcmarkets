/**
 * Auth routes configuration
 * Registers all authentication-related HTTP endpoints
 * 
 * Available endpoints:
 * - POST /auth/register - Create new user account
 * - POST /auth/login - Authenticate and create session
 * - POST /auth/refresh - Refresh access token
 * - POST /auth/logout - End specific session
 * - POST /auth/logout-all - End all sessions for a user
 * - GET /auth/sessions - List active sessions for a user
 * 
 * Security notes:
 * - All endpoints use centralized error handling
 * - Validation errors are sanitized before returning to client
 * - Auth errors are mapped to appropriate HTTP status codes
 */

import type { Router } from "../../api/types.js";
import type { AuthService } from "./authService.js";
import type { SessionInvalidationReason } from "./auth.types.js";
import { createLoginController } from "./authController.js";
import { toHttpErrorResponse } from "../../api/errors.js";
import { validateLogout, validateLogoutAll, validateRefresh, validateRegister } from "./authValidator.js";

type LoggerLike = {
	error: (msg: string, meta?: Record<string, unknown>) => void;
};

/**
 * Register all auth routes with the given router
 * @param router - HTTP router instance
 * @param services - Service dependencies (auth service)
 * @param logger - Logger for error tracking
 */
export function registerAuthRoutes(
	router: Router,
	services: { auth: AuthService },
	logger: LoggerLike,
): void {
	/**
	 * POST /auth/register
	 * Create a new user account
	 * Optionally issues a session (default: true)
	 */
	router.route("POST", "/auth/register", async (req) => {
		try {
			const body = validateRegister(req.body);
			const result = await services.auth.register({
				email: body.email,
				password: body.password,
				issueSession: body.issueSession,
			});
			return { status: 200, body: result };
		} catch (e) {
			if (e instanceof Error && e.message.startsWith("validation_error")) {
				return { status: 400, body: { error: "invalid_body" } };
			}
			return toHttpErrorResponse(e, logger);
		}
	});

	/**
	 * POST /auth/login
	 * Authenticate user with email/password
	 * Returns user, session, and token pair on success
	 */
	router.route("POST", "/auth/login", createLoginController(services.auth));

	/**
	 * POST /auth/refresh
	 * Refresh access token using refresh token
	 * Implements token rotation for security
	 */
	router.route("POST", "/auth/refresh", async (req) => {
		try {
			const body = validateRefresh(req.body);
			const result = await services.auth.refreshSession({ refreshToken: body.refreshToken });
			return { status: 200, body: result };
		} catch (e) {
			if (e instanceof Error && e.message.startsWith("validation_error")) {
				return { status: 400, body: { error: "invalid_body" } };
			}
			return toHttpErrorResponse(e, logger);
		}
	});

	/**
	 * POST /auth/logout
	 * Invalidate a specific session
	 * Requires sessionId and optional userId for ownership check
	 */
	router.route("POST", "/auth/logout", async (req) => {
		try {
			const body = validateLogout(req.body);
			await services.auth.logout({
				sessionId: body.sessionId,
				userId: body.userId,
				reason: body.reason as SessionInvalidationReason | undefined,
			});
			return { status: 204 };
		} catch (e) {
			if (e instanceof Error && e.message.startsWith("validation_error")) {
				return { status: 400, body: { error: "invalid_body" } };
			}
			return toHttpErrorResponse(e, logger);
		}
	});

	/**
	 * POST /auth/logout-all
	 * Invalidate all sessions for a user
	 * Can optionally exclude the current session
	 */
	router.route("POST", "/auth/logout-all", async (req) => {
		try {
			const body = validateLogoutAll(req.body);
			await services.auth.logoutAll({
				userId: body.userId,
				excludeSessionId: body.excludeSessionId,
				reason: body.reason as SessionInvalidationReason | undefined,
			});
			return { status: 204 };
		} catch (e) {
			if (e instanceof Error && e.message.startsWith("validation_error")) {
				return { status: 400, body: { error: "invalid_body" } };
			}
			return toHttpErrorResponse(e, logger);
		}
	});

	/**
	 * GET /auth/sessions
	 * List all active sessions for a user
	 * Requires userId query parameter
	 */
	router.route("GET", "/auth/sessions", async (req) => {
		const userId = req.query["userId"];
		if (!userId) return { status: 400, body: { error: "user_id_required" } };

		const sessions = await services.auth.listActiveSessions(userId);
		return { status: 200, body: { sessions } };
	});
}
