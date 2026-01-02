import { z } from "zod";

const balanceSchema = z
  .object({
    userId: z.string().min(1),
    amount: z.number(),
    type: z.enum(["deposit", "withdraw"]),
  })
  .strict();

export type AdminBalanceBody = z.infer<typeof balanceSchema>;

export function validateAdminBalanceBody(body: unknown): AdminBalanceBody {
  const parsed = balanceSchema.safeParse(body);
  if (parsed.success) return parsed.data;
  throw new Error("validation_error: invalid_body");
}
