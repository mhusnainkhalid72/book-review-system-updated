import { z } from 'zod';

export const RegisterDTOSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

export type RegisterDTO = z.infer<typeof RegisterDTOSchema>;
