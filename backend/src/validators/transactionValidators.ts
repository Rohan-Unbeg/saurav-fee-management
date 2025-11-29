import { z } from 'zod';

export const createTransactionSchema = z.object({
  body: z.object({
    studentId: z.string().min(1, 'Student ID is required'),
    amount: z.number(),
    mode: z.enum(['Cash', 'UPI', 'Cheque']),
    transactionReferenceId: z.string().optional(),
    remark: z.string().optional(),
  }),
});
