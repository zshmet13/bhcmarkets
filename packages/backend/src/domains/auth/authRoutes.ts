import type { Router } from "../../api/types.js";
import type { AuthService } from "./authService.js";
import type { SessionInvalidationReason } from "./auth.types.js";
import { createLoginController } from "./authController.js";
import { toHttpErrorResponse } from "../../api/errors.js";
import { validateLogout, validateLogoutAll, validateRefresh, validateRegister } from "./authValidator.js";

type LoggerLike = {
	error: (msg: string, meta?: Record<string, unknown>) => void;
};

export function registerAuthRoutes(
	router: Router,
	services: { auth: AuthService },
	logger: LoggerLike,
): void {
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

	router.route("POST", "/auth/login", createLoginController(services.auth));

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

	router.route("GET", "/auth/sessions", async (req) => {
		const userId = req.query["userId"];
		if (!userId) return { status: 400, body: { error: "user_id_required" } };

		const sessions = await services.auth.listActiveSessions(userId);
		return { status: 200, body: { sessions } };
	});
}
