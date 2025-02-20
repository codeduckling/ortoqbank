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
    const user = await getCurrentUserOrThrow(ctx);

    if (!args.presetQuizId && !args.customQuizId) {
      throw new Error('Either presetQuizId or customQuizId must be provided');
    }

    let activeSession = await getActiveQuizSession(ctx, user._id, args);

    if (!activeSession) {
      activeSession = await ctx.db.insert('quizSessions', {
        userId: user._id,
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

    return activeSession;
  },
});

export const get = query({
  args: {
    presetQuizId: v.optional(v.id('presetQuizzes')),
    customQuizId: v.optional(v.id('customQuizzes')),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    if (!args.presetQuizId && !args.customQuizId) {
      throw new Error('Either presetQuizId or customQuizId must be provided');
    }

    return ctx.db
      .query('quizSessions')
      .withIndex('by_user', q => q.eq('userId', user._id))
      .filter(q =>
        q.and(
          q.eq(q.field('status'), 'in_progress'),
          args.presetQuizId
            ? q.eq(q.field('presetQuizId'), args.presetQuizId)
            : q.eq(q.field('customQuizId'), args.customQuizId),
        ),
      )
      .first();
  },
});

export const updateProgress = mutation({
  args: {
    sessionId: v.id('quizSessions'),
    answer: v.object({
      questionId: v.id('questions'),
      selectedOption: v.number(),
      isCorrect: v.boolean(),
    }),
    currentQuestionIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status !== 'in_progress') {
      throw new Error('Cannot update completed session');
    }

    // Update progress
    const progress = {
      currentQuestionIndex: args.currentQuestionIndex,
      answers: [
        ...(session.progress?.answers || []),
        {
          questionId: args.answer.questionId,
          selectedOption: args.answer.selectedOption,
          isCorrect: args.answer.isCorrect,
        },
      ],
    };

    // Calculate new score
    const score = progress.answers.filter(a => a.isCorrect).length;

    // Update session
    await ctx.db.patch(args.sessionId, {
      progress,
      score,
    });

    return { progress, score };
  },
});

export const completeSession = mutation({
  args: { sessionId: v.id('quizSessions') },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status === 'completed') {
      throw new Error('Session already completed');
    }

    // Calculate final score from progress
    const finalScore =
      session.progress?.answers.filter(a => a.isCorrect).length ?? 0;

    // Update session with completion data
    await ctx.db.patch(sessionId, {
      status: 'completed',
      endTime: Date.now(),
      score: finalScore,
    });

    return { success: true };
  },
});

export const getById = query({
  args: {
    sessionId: v.id('quizSessions'),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    return session;
  },
});

export const getCompletedSession = query({
  args: {
    presetQuizId: v.id('presetQuizzes'),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    return ctx.db
      .query('quizSessions')
      .withIndex('by_user', q => q.eq('userId', user._id))
      .filter(q =>
        q.and(
          q.eq(q.field('status'), 'completed'),
          q.eq(q.field('presetQuizId'), args.presetQuizId),
        ),
      )
      .first();
  },
});
