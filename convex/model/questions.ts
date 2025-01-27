/* eslint-disable unicorn/prevent-abbreviations */

import { type MutationCtx, type QueryCtx } from '../_generated/server';
import { THEMES } from '../constants';

export type QuestionInput = {
  text: string;
  options: {
    text: string;
    imageUrl?: string;
  }[];
  correctOptionIndex: number;
  explanation: string;
  theme: string;
  subjects: string[];
  imageUrl?: string;
};

export async function createQuestion(
  ctx: MutationCtx,
  questionData: QuestionInput,
) {
  return await ctx.db.insert('questions', questionData);
}

export async function getAllThemeCounts(
  ctx: QueryCtx,
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  await Promise.all(
    THEMES.map(async theme => {
      const questions = await ctx.db
        .query('questions')
        .withIndex('by_theme', q => q.eq('theme', theme.name))
        .collect();
      counts[theme.name] = questions.length;
    }),
  );

  return counts;
}
