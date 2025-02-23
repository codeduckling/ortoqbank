import { v } from 'convex/values';

import { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { getCurrentUserOrThrow } from './users';

export const getCurrentSession = query({
  args: { quizId: v.union(v.id('presetQuizzes'), v.id('customQuizzes')) },
  handler: async (ctx, { quizId }) => {
    const mockUser = 'j571n8n6pntprjpnv9w22th81n78fq8y' as Id<'users'>;

    const session = ctx.db
      .query('quizSessions')
      .withIndex('by_user_quiz', q =>
        q.eq('userId', mockUser).eq('quizId', quizId).eq('isComplete', false),
      )
      .first();

    return session;
  },
});

export const startQuizSession = mutation({
  args: {
    quizId: v.union(v.id('presetQuizzes'), v.id('customQuizzes')),
    mode: v.union(v.literal('study'), v.literal('exam')),
  },
  handler: async (ctx, { quizId, mode }) => {
    const user = await getCurrentUserOrThrow(ctx);

    const sessionId = await ctx.db.insert('quizSessions', {
      userId: user._id,
      quizId,
      mode,
      currentQuestionIndex: 0,
      answers: [],
      answerFeedback: [],
      isComplete: false,
    });

    return { sessionId };
  },
});
