import { z } from "zod";

const positionsQuerySchema = z
  .object({
    userId: z.string().min(1),
  })
  .strict();

export type PositionsQuery = z.infer<typeof positionsQuerySchema>;

export function validatePositionsQuery(query: Record<string, string>): PositionsQuery {
  const parsed = positionsQuerySchema.safeParse(query);
  if (parsed.success) return parsed.data;
  throw new Error("validation_error: userId required");
}
