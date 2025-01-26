import { MutationCtx } from '../_generated/server';

export async function createQuestion(
  ctx: MutationCtx,
  question: {
    text: string;
    options: { text: string; imageUrl?: string }[];
    correctOptionIndex: number;
    explanation: string;
    subject: string;
    tags: string[];
    imageUrl?: string;
  },
) {
  return await ctx.db.insert('questions', question);
}
