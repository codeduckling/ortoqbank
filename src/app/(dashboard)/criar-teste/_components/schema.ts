import { z } from 'zod';

export const testFormSchema = z.object({
  testMode: z.enum(['study', 'exam']),
  questionMode: z
    .array(z.enum(['unused', 'incorrect', 'marked', 'all']))
    .min(1, 'Selecione pelo menos um modo'),
  selectedThemes: z.array(z.string()),
  selectedSubthemes: z.array(z.string()),
  selectedGroups: z.array(z.string()),
});

export type TestFormData = z.infer<typeof testFormSchema>;
