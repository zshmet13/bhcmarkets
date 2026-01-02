import type { Router } from "../../api/types.js";
import type { AccountService } from "../account/account.service.js";
import type { OrderService } from "./order.service.js";
import { getAuthUser } from "../../api/middleware.js";
import type { AuthServices } from "../../api/middleware.js";
import { validatePlaceOrderHttpBody } from "./orderHttpValidator.js";

type LoggerLike = {
  error: (msg: string, meta?: Record<string, unknown>) => void;
};

export function registerOrderHttpRoutes(
  router: Router,
  services: AuthServices & { account: AccountService; order: OrderService },
  logger: LoggerLike,
): void {
  router.route("POST", "/orders", async (req) => {
    const auth = await getAuthUser(req, services);
    if (!auth) return { status: 401, body: { error: "unauthorized" } };

    let body: ReturnType<typeof validatePlaceOrderHttpBody>;
    try {
      body = validatePlaceOrderHttpBody(req.body);
    } catch {
      return { status: 400, body: { error: "invalid_body" } };
    }

    if (auth.sub !== body.userId) {
      return { status: 403, body: { error: "forbidden" } };
    }

    try {
      const account = await services.account.getAccount(body.userId);
      if (!account) return { status: 404, body: { error: "account_not_found" } };

      const result = await services.order.place({
        accountId: account.id,
        symbol: body.symbol,
        side: body.side,
        type: body.type,
        quantity: body.quantity.toString(),
        price: body.price?.toString(),
      });

      return { status: 200, body: result };
    } catch (e) {
      logger.error("order_error", { err: String(e) });
      return { status: 500, body: { error: "order_failed" } };
    }
  });
}
