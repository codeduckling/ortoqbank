import { v } from 'convex/values';

import { Doc, Id } from './_generated/dataModel';
import { mutation, query, type QueryCtx } from './_generated/server';
import { getCurrentUserOrThrow } from './users';

async function getActiveQuizSession(
  ctx: QueryCtx,
  userId: Id<'users'>,
  args: {
    presetQuizId?: Id<'presetQuizzes'>;
    customQuizId?: Id<'customQuizzes'>;
  },
): Promise<Id<'quizSessions'> | null> {
  //eslint-disable-next-line playwright/no-useless-await
  const session = await ctx.db
    .query('quizSessions')
    .withIndex('by_user', q => q.eq('userId', userId))
    .filter(q =>
      q.and(
        q.eq(q.field('status'), 'in_progress'),
        args.presetQuizId
          ? q.eq(q.field('presetQuizId'), args.presetQuizId)
          : q.eq(q.field('customQuizId'), args.customQuizId),
      ),
    )
    .first();

  // eslint-disable-next-line unicorn/no-null
  return session?._id ?? null;
}

export const startQuizSession = mutation({
  args: {
    presetQuizId: v.optional(v.id('presetQuizzes')),
    customQuizId: v.optional(v.id('customQuizzes')),
  },
  handler: async (ctx, args) => {
    //const user = await getCurrentUserOrThrow(ctx);
    const mockUser = 'j571n8n6pntprjpnv9w22th81n78fq8y' as Id<'users'>;

    if (!args.presetQuizId && !args.customQuizId) {
      throw new Error('Either presetQuizId or customQuizId must be provided');
    }

    let activeSession = await getActiveQuizSession(ctx, mockUser, args);

    if (!activeSession) {
      activeSession = await ctx.db.insert('quizSessions', {
        userId: mockUser,
        presetQuizId: args.presetQuizId,
        customQuizId: args.customQuizId,
        status: 'in_progress',
        score: 0,
        progress: {
          currentQuestionIndex: 0,
          answers: [],
        },
      });
    }

    //3. Fetch the quiz (either preset or custom)
    let quiz;
    if (args.presetQuizId) {
      quiz = await ctx.db.get(args.presetQuizId);
    } else if (args.customQuizId) {
      quiz = await ctx.db.get(args.customQuizId);
    }
    if (!quiz) {
      throw new Error('Quiz not found.');
    }

    // 4. Fetch questions based on the IDs in quiz.questions
    const questionIds = quiz.questions as Id<'questions'>[];
    const questions = await Promise.all(
      questionIds.map(qId => ctx.db.get(qId)),
    );

    // 5. Return session + questions to the client
    //    - The client can immediately display the questions or store them locally
    //    - Optionally return the "activeSession" doc if you want the entire object
    return { session: activeSession, questions };
  },
});
