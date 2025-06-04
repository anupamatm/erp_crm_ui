import { z } from 'zod';

export const transactionSchema = z.object({
  date: z.date({
    required_error: 'Transaction date is required',
  }),
  type: z.enum(['Income', 'Expense', 'Transfer']),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  accountId: z.string().min(1, 'Please select an account'),
  toAccountId: z.string().optional(),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  reference: z.string().optional(),
  attachments: z.array(z.any()).optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
