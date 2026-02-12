import { z } from 'zod';

export const createTreasureHuntSchema = z.object({
  finalMessage: z.string().min(10, 'Final message must be at least 10 characters'),
  finalGpsLat: z.number().optional(),
  finalGpsLng: z.number().optional(),
  steps: z.array(
    z.object({
      stepNumber: z.number().min(1),
      title: z.string().min(1, 'Title is required'),
      description: z.string().min(1, 'Description is required'),
      hint1: z.string().optional(),
      hint2: z.string().optional(),
      answerType: z.enum(['text', 'mcq', 'number', 'gps']),
      correctAnswer: z.string().min(1, 'Correct answer is required'),
      successMessage: z.string().optional(),
      errorMessage: z.string().optional(),
      imageUrl: z.string().url().optional()
    })
  ).min(3, 'At least 3 steps are required').max(10, 'Maximum 10 steps allowed')
});

export const validateStepSchema = z.object({
  answer: z.string().min(1, 'Answer is required')
});

export type CreateTreasureHuntDto = z.infer<typeof createTreasureHuntSchema>;
export type ValidateStepDto = z.infer<typeof validateStepSchema>;
