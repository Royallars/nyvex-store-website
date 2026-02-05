import { z } from 'zod';

const badWords = ['admin', 'owner', 'mod'];

export const mcNameSchema = z
  .string()
  .regex(/^[A-Za-z0-9_]{3,16}$/, 'Ungültiger Minecraft Name')
  .refine((v) => !badWords.some((w) => v.toLowerCase().includes(w)), 'Name blockiert');

export const checkoutSchema = z.object({
  email: z.string().email(),
  minecraftName: mcNameSchema,
  giftTarget: mcNameSchema.optional(),
  promoCode: z.string().max(32).optional(),
  affiliateCode: z.string().max(32).optional(),
  currentRankSlug: z.string().optional(),
  lines: z.array(z.object({ productId: z.string(), quantity: z.number().int().min(1).max(10) })).min(1),
  addOrderBump: z.boolean().optional()
});

export const deliveryAckSchema = z.object({
  jobId: z.string(),
  success: z.boolean(),
  log: z.string().optional(),
  timestamp: z.number().int(),
  nonce: z.string().min(8)
});

export const deliveryPullSchema = z.object({
  limit: z.number().int().min(1).max(50).default(10),
  timestamp: z.number().int(),
  nonce: z.string().min(8)
});
