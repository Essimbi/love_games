import { z } from 'zod';

export const createLoveWheelSchema = z.object({
  maxSpinsPerDay: z.number().min(1).max(100),
  sections: z.array(
    z.object({
      sectionNumber: z.number().min(1),
      text: z.string().min(1, 'Text is required').max(20),
      description: z.string().optional(),
      color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
      icon: z.string().optional(),
      probabilityWeight: z.number().min(1).max(100)
    })
  ).min(6, 'At least 6 sections are required').max(12, 'Maximum 12 sections allowed')
});

export const spinWheelSchema = z.object({
  sessionId: z.string().optional()
});

export type CreateLoveWheelDto = z.infer<typeof createLoveWheelSchema>;
export type SpinWheelDto = z.infer<typeof spinWheelSchema>;
