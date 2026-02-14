import { z } from 'zod';

export const createTreasureHuntSchema = z.object({
  finalMessage: z.string().min(5, 'Final message must be at least 5 characters'),
  mapId: z.string().min(1, 'Map ID is required'),
  treasurePosition: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number()
  }),
  steps: z.array(
    z.object({
      stepNumber: z.number().min(1),
      title: z.string().min(1, 'Title is required'),
      description: z.string().min(1, 'Description is required'),
      answerType: z.enum(['text', 'mcq', 'number']),
      correctAnswer: z.string().min(1, 'Correct answer is required'),
      position: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number()
      })
    })
  ).min(3, 'At least 3 steps are required').max(10, 'Maximum 10 steps allowed')
});

export const validateStepSchema = z.object({
  answer: z.string().min(1, 'Answer is required')
});

export type CreateTreasureHuntDto = z.infer<typeof createTreasureHuntSchema>;
export type ValidateStepDto = z.infer<typeof validateStepSchema>;
