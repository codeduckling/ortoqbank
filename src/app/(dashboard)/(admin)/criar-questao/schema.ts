import { z } from 'zod';

export const questionSchema = z.object({
  text: z.string().min(1, 'O texto da questão é obrigatório'),
  imageUrl: z.string().optional(),
  options: z.array(
    z.object({
      text: z.string().min(1, 'O texto da opção é obrigatório'),
      imageUrl: z.string().optional(),
    }),
  ),
  correctOptionIndex: z.number(),
  explanation: z.string().min(1, 'A explicação é obrigatória'),
  themeId: z.string().min(1, 'O tema é obrigatório'),
  subthemeIds: z.array(z.string()).min(1, 'Selecione pelo menos um subtema'),
});

export type QuestionFormData = z.infer<typeof questionSchema>;
