import { z } from 'zod';

export const CreateBookDTOSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  description: z.string().optional()
});

export type CreateBookDTO = z.infer<typeof CreateBookDTOSchema>;
