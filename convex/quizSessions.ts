import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { getCurrentUserOrThrow } from './users';

export const create = mutation({
  args: {
    presetQuizId: v.optional(v.id('presetQuizzes')),
    customQuizId: v.optional(v.id('customQuizzes')),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    if (!args.presetQuizId && !args.customQuizId) {
      throw new Error('Either presetQuizId or customQuizId must be provided');
    }

    // Check for existing active session
    const activeSession = await ctx.db
      .query('quizSessions')
      .withIndex('by_user', q => q.eq('userId', user._id))
      .filter(q => q.eq(q.field('status'), 'in_progress'))
      .unique();

    if (activeSession) {
      throw new Error('User already has an active quiz session');
    }

    return await ctx.db.insert('quizSessions', {
      userId: user._id,
      presetQuizId: args.presetQuizId,
      customQuizId: args.customQuizId,
      status: 'in_progress',
      score: 0,
    });
  },
});
