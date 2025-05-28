import { z } from 'zod';

export const testFormSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome precisa ter no mínimo 3 caracteres')
    .default('Personalizado'),
  testMode: z.enum(['study', 'exam']),
  questionMode: z.enum(['all', 'unanswered', 'incorrect', 'bookmarked']),
  numQuestions: z.number().min(1).max(120).default(30),
  selectedThemes: z.array(z.string()), // Taxonomy IDs for themes
  selectedSubthemes: z.array(z.string()), // Taxonomy IDs for subthemes
  selectedGroups: z.array(z.string()), // Taxonomy IDs for groups
});

export type TestFormData = z.infer<typeof testFormSchema>;

// Legacy support - keeping for backward compatibility during transition
export const legacyTestFormSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome precisa ter no mínimo 3 caracteres')
    .default('Personalizado'),
  testMode: z.enum(['study', 'exam']),
  questionMode: z.enum(['all', 'unanswered', 'incorrect', 'bookmarked']),
  numQuestions: z.number().min(1).max(120).default(30),
  selectedThemes: z.array(z.string()),
  selectedSubthemes: z.array(z.string()),
  selectedGroups: z.array(z.string()),
});

export type LegacyTestFormData = z.infer<typeof legacyTestFormSchema>;
