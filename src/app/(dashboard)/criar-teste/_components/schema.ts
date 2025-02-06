import { z } from 'zod';

export const testFormSchema = z.object({
  testMode: z.enum(['simulado', 'estudo']),
  questionMode: z
    .array(z.enum(['unused', 'incorrect', 'marked', 'all', 'custom']))
    .min(1, 'Selecione pelo menos um modo'),
  selectedThemes: z.array(z.string()).min(1, 'Selecione pelo menos um tema'),
  selectedSubthemes: z.array(z.string()),
  selectedGroups: z.array(z.string()),
});

export type TestFormData = z.infer<typeof testFormSchema>;
