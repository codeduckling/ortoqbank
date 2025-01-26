import { z } from 'zod';

export const questionSchema = z.object({
  text: z.string().min(10, 'A questão deve ter pelo menos 10 caracteres'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  options: z
    .array(
      z.object({
        text: z.string().min(1, 'A alternativa não pode estar vazia'),
        imageUrl: z.string().url().optional().or(z.literal('')),
      }),
    )
    .length(4, 'A questão deve ter exatamente 4 alternativas'),
  correctOptionIndex: z.number().min(0).max(3),
  explanation: z
    .string()
    .min(10, 'A explicação deve ter pelo menos 10 caracteres'),
  theme: z.string().min(3, 'O tema deve ter pelo menos 3 caracteres'),
  subjects: z.array(z.string().min(1, 'Assunto não pode estar vazio')),
});

export type QuestionFormData = z.infer<typeof questionSchema>;
