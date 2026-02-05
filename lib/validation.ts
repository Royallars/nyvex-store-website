import { z } from 'zod';

export const checkoutSchema = z.object({
  email: z.string().email(),
  minecraftName: z.string().min(3).max(16),
  lines: z.array(z.object({ productId: z.string(), quantity: z.number().int().min(1).max(10) })).min(1)
});

export const deliveryPullSchema = z.object({
  limit: z.number().int().min(1).max(50).default(10)
});
