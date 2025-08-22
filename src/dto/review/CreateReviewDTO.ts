import { z } from 'zod';

export const CreateReviewDTOSchema = z.object({
  bookId: z.string().min(1),
  rating: z.number().min(0).max(5),
  message: z.string().optional()
});

export type CreateReviewDTO = z.infer<typeof CreateReviewDTOSchema>;
