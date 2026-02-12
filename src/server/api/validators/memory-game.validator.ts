import { z } from 'zod';

export const createMemoryGameSchema = z.object({
  finalMessage: z.string().min(1).max(5000),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).default('medium'),
  images: z.array(z.string()).min(4).max(8)
});

export type CreateMemoryGameDto = z.infer<typeof createMemoryGameSchema>;

export const completeMemoryGameSchema = z.object({
  timeSeconds: z.number().int().positive(),
  movesCount: z.number().int().positive()
});

export type CompleteMemoryGameDto = z.infer<typeof completeMemoryGameSchema>;

export const memoryGameResponseSchema = z.object({
  id: z.string(),
  finalMessage: z.string(),
  difficultyLevel: z.string(),
  createdAt: z.string().datetime()
});

export type MemoryGameResponse = z.infer<typeof memoryGameResponseSchema>;
