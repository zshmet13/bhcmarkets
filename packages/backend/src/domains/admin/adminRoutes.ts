import type { Router } from "../../api/types.js";
import type { AccountService } from "../account/account.service.js";
import { getAuthUser } from "../../api/middleware.js";
import type { AuthServices } from "../../api/middleware.js";
import { validateAdminBalanceBody } from "./adminValidator.js";

type LoggerLike = {
  error: (msg: string, meta?: Record<string, unknown>) => void;
};

export function registerAdminRoutes(
  router: Router,
  services: AuthServices & { account: AccountService },
  logger: LoggerLike,
): void {
  router.route("GET", "/admin/users", async (req) => {
    const auth = await getAuthUser(req, services);
    if (!auth) return { status: 401, body: { error: "unauthorized" } };
    if (auth.role !== "admin") return { status: 403, body: { error: "forbidden_admin_only" } };

    const accounts = await services.account.getAllAccounts();
    return { status: 200, body: accounts };
  });

  router.route("POST", "/admin/balance", async (req) => {
    const auth = await getAuthUser(req, services);
    if (!auth) return { status: 401, body: { error: "unauthorized" } };
    if (auth.role !== "admin") return { status: 403, body: { error: "forbidden_admin_only" } };

    let body: ReturnType<typeof validateAdminBalanceBody>;
    try {
      body = validateAdminBalanceBody(req.body);
    } catch {
      return { status: 400, body: { error: "invalid_body" } };
    }

    try {
      const result = await services.account.updateBalance(body.userId, body.amount, body.type);
      return { status: 200, body: result };
    } catch (e) {
      logger.error("balance_update_error", { err: String(e) });
      return { status: 400, body: { error: e instanceof Error ? e.message : "update_failed" } };
    }
  });
}
