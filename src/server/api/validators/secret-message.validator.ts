import { z } from 'zod';

export const createSecretMessageSchema = z.object({
  encryptedContent: z.string().min(1).max(50000),
  maxViews: z.number().int().min(1).max(5),
  expiresAt: z.string().datetime().optional(),
  backgroundImage: z.string().url().optional(),
});

export type CreateSecretMessageDto = z.infer<typeof createSecretMessageSchema>;

export const secretMessageResponseSchema = z.object({
  id: z.string(),
  maxViews: z.number(),
  currentViews: z.number(),
  expiresAt: z.string().datetime().nullable(),
  backgroundImage: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export type SecretMessageResponse = z.infer<typeof secretMessageResponseSchema>;
