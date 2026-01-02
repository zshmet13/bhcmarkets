import type { Router } from "../../api/types.js";
import type { PositionService } from "./position.service.js";
import { getAuthUser } from "../../api/middleware.js";
import type { AuthServices } from "../../api/middleware.js";
import { validatePositionsQuery } from "./positionValidator.js";

export function registerPositionRoutes(
  router: Router,
  services: AuthServices & { position: PositionService },
): void {
  router.route("GET", "/positions", async (req) => {
    const auth = await getAuthUser(req, services);
    if (!auth) return { status: 401, body: { error: "unauthorized" } };

    let query: { userId: string };
    try {
      query = validatePositionsQuery(req.query);
    } catch {
      return { status: 400, body: { error: "user_id_required" } };
    }

    if (auth.sub !== query.userId && auth.role !== "admin") {
      return { status: 403, body: { error: "forbidden" } };
    }

    const positions = await services.position.getPositions(query.userId);
    return { status: 200, body: positions };
  });
}
