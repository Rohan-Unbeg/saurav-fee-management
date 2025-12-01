import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3, 'Username must be at least 3 characters long'),
    password: z.string().min(8, 'Password must be at least 8 characters long')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    role: z.enum(['admin', 'staff']).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});
