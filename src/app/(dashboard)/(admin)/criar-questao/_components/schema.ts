import { z } from 'zod';

import { Id } from '../../../../../../convex/_generated/dataModel';

export const questionSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  questionText: z.object({
    type: z.string(),
    content: z.array(z.any()),
  }),
  options: z.array(
    z.object({
      text: z.string().min(1, 'Texto da alternativa é obrigatório'),
    }),
  ),

  correctOptionIndex: z.number(),
  explanationText: z.object({
    type: z.string(),
    content: z.array(z.any()),
  }),
  themeId: z.custom<Id<'themes'>>(),
  subthemeId: z.custom<Id<'subthemes'>>().optional(),
  groupId: z.custom<Id<'groups'>>().optional(),
});

export const themeSchema = z.object({
  name: z.string().min(3, 'Mínimo de 3 caracteres'),
});

export const subthemeSchema = z.object({
  name: z.string().min(1, 'O nome do subtema é obrigatório'),
  themeId: z.custom<Id<'themes'>>(),
});

export type QuestionFormData = z.infer<typeof questionSchema>;
export type ThemeFormData = z.infer<typeof themeSchema>;
export type SubthemeFormData = z.infer<typeof subthemeSchema>;
