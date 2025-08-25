import { z } from 'zod';

export const UpdateBookDTOSchema = z.object({
  title: z.string().min(1).optional(),
  author: z.string().min(1).optional(),
  description: z.string().optional()
});

export type UpdateBookDTO = z.infer<typeof UpdateBookDTOSchema>;
