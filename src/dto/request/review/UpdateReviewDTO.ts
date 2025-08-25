import { z } from 'zod';

export const UpdateReviewDTOSchema = z.object({
  rating: z.number().min(0).max(5).optional(),
  message: z.string().optional()
});

export type UpdateReviewDTO = z.infer<typeof UpdateReviewDTOSchema>;
