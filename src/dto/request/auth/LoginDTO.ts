import { z } from 'zod';

export const LoginDTOSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export type LoginDTO = z.infer<typeof LoginDTOSchema>;
