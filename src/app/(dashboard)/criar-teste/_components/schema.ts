import { z } from 'zod';

export const testFormSchema = z.object({
  testMode: z.enum(['study', 'exam']),
  questionMode: z.enum(['unused', 'incorrect', 'marked', 'all']),
  numQuestions: z.number().min(1).max(120).default(30),
  selectedThemes: z.array(z.string()),
  selectedSubthemes: z.array(z.string()),
  selectedGroups: z.array(z.string()),
});

export type TestFormData = z.infer<typeof testFormSchema>;
