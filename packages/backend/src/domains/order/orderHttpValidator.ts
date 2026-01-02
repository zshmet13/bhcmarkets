import { z } from "zod";


const placeOrderSchema = z
  .object({
    userId: z.string().min(1),
    symbol: z.string().min(1),
    side: z.enum(["buy", "sell"]),
    type: z.enum(["market", "limit", "stop", "take_profit"]),
    quantity: z.number(),
    price: z.number().optional(),
  })
  .strict();

export type PlaceOrderHttpBody = z.infer<typeof placeOrderSchema>;

export function validatePlaceOrderHttpBody(body: unknown): PlaceOrderHttpBody {
  const parsed = placeOrderSchema.safeParse(body);
  if (parsed.success) return parsed.data;
  throw new Error("validation_error: invalid_body");
}
