/* eslint-disable unicorn/filename-case */
import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { getCurrentUser } from './users';

export const create = mutation({
  args: {
    presetExamId: v.optional(v.id('presetExams')),
    customExamId: v.optional(v.id('customExams')),
  },
  handler: async (context, arguments_) => {
    const user = await getCurrentUser(context);
    if (!user) throw new Error('Not authenticated');

    // Check for existing active session
    const activeSession = await context.db
      .query('quizSessions')
      .withIndex('by_user', q => q.eq('userId', user._id))
      .filter(q => q.eq(q.field('status'), 'in_progress'))
      .unique();

    if (activeSession) {
      throw new Error('User already has an active quiz session');
    }

    return await context.db.insert('quizSessions', {
      userId: user._id,
      presetExamId: arguments_.presetExamId,
      customExamId: arguments_.customExamId,
      status: 'in_progress',
      score: 0,
    });
  },
});

export const getActiveSession = query({
  args: {},
  handler: async (context, _) => {
    const user = await getCurrentUser(context);
    if (!user) return;

    const activeSession = await context.db
      .query('quizSessions')
      .withIndex('by_user', q => q.eq('userId', user._id))
      .filter(q => q.eq(q.field('status'), 'in_progress'))
      .unique();

    return activeSession;
  },
});

export const completeSession = mutation({
  args: {
    sessionId: v.id('quizSessions'),
    score: v.number(),
  },
  handler: async (context, arguments_) => {
    await context.db.patch(arguments_.sessionId, {
      status: 'completed',
      score: arguments_.score,
      endTime: Date.now(),
    });
  },
});

export const updateProgress = mutation({
  args: {
    sessionId: v.id('quizSessions'),
    currentQuestionIndex: v.number(),
    answer: v.optional(
      v.object({
        questionId: v.id('questions'),
        selectedOption: v.number(),
        isCorrect: v.boolean(),
      }),
    ),
  },
  handler: async (context, arguments_) => {
    const session = await context.db.get(arguments_.sessionId);
    if (!session) throw new Error('Session not found');

    const currentProgress = session.progress ?? {
      currentQuestionIndex: 0,
      answers: [],
    };

    const newProgress = {
      currentQuestionIndex: arguments_.currentQuestionIndex,
      answers: arguments_.answer
        ? [...currentProgress.answers, arguments_.answer]
        : currentProgress.answers,
    };

    await context.db.patch(arguments_.sessionId, {
      progress: newProgress,
    });
  },
});
