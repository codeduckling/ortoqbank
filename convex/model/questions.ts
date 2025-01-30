/* eslint-disable unicorn/prevent-abbreviations */

import { Id } from '../_generated/dataModel';
import {
  type MutationCtx as MutationContext,
  type QueryCtx as QueryContext,
} from '../_generated/server';

export type QuestionInput = {
  text: string;
  imageUrl?: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  themeId: Id<'themes'>;
  subthemeId: Id<'subthemes'>;
  themeName: string;
  subthemeName: string;
};

async function generateFriendlyId(ctx: MutationContext): Promise<string> {
  const questions = await ctx.db.query('questions').collect();
  const nextNumber = questions.length + 1;
  return `Q${nextNumber.toString().padStart(3, '0')}`;
}

export async function createQuestion(
  ctx: MutationContext,
  questionData: QuestionInput,
) {
  const friendlyId = await generateFriendlyId(ctx);
  return await ctx.db.insert('questions', {
    ...questionData,
    friendlyId,
  });
}

export async function getAllThemeCounts(
  ctx: QueryContext,
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  const questions = await ctx.db.query('questions').collect();

  // Group questions by themeId
  for (const question of questions) {
    const theme = await ctx.db.get(question.themeId);
    if (theme) {
      counts[theme.name] = (counts[theme.name] || 0) + 1;
    }
  }

  return counts;
}
