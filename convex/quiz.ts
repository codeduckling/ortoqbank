import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { getCurrentUserOrThrow } from './users';

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    questions: v.array(v.id('questions')),
    themeId: v.id('themes'),
    subthemeId: v.optional(v.id('subthemes')),
    groupId: v.optional(v.id('groups')),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('presetQuiz', {
      ...args,
      isPublic: false, // Default to private
    });
  },
});

export const getById = query({
  args: { id: v.id('presetQuiz') },
  handler: async (ctx, { id }) => {
    const quiz = await ctx.db.get(id);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Fetch all questions data
    const questions = await Promise.all(
      quiz.questions.map(questionId => ctx.db.get(questionId)),
    );

    return {
      ...quiz,
      questions: questions.filter(Boolean), // Remove any null values
    };
  },
});
