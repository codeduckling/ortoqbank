import { v } from 'convex/values';

import { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { getCurrentUserOrThrow } from './users';

export const getCurrentSession = query({
  args: { quizId: v.union(v.id('presetQuizzes'), v.id('customQuizzes')) },
  handler: async (ctx, { quizId }) => {
    const userId = await getCurrentUserOrThrow(ctx);

    return ctx.db
      .query('quizSessions')
      .withIndex('by_user_quiz', q =>
        q.eq('userId', userId._id).eq('quizId', quizId).eq('isComplete', false),
      )
      .first();
  },
});

export const startQuizSession = mutation({
  args: {
    quizId: v.union(v.id('presetQuizzes'), v.id('customQuizzes')),
    mode: v.union(v.literal('study'), v.literal('exam')),
  },
  handler: async (ctx, { quizId, mode }) => {
    const userId = await getCurrentUserOrThrow(ctx);

    const sessionId = await ctx.db.insert('quizSessions', {
      userId: userId._id,
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

export const submitAnswerAndProgress = mutation({
  args: {
    quizId: v.union(v.id('presetQuizzes'), v.id('customQuizzes')),
    selectedAlternativeIndex: v.union(
      v.literal(0),
      v.literal(1),
      v.literal(2),
      v.literal(3),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);

    // 1. Get current session
    const session = await ctx.db
      .query('quizSessions')
      .withIndex('by_user_quiz', q =>
        q
          .eq('userId', userId._id)
          .eq('quizId', args.quizId)
          .eq('isComplete', false),
      )
      .first();

    if (!session) throw new Error('No active quiz progress found');

    // 2. Get quiz and current question
    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) throw new Error('Quiz not found');

    const currentQuestion = await ctx.db.get(
      quiz.questions[session.currentQuestionIndex],
    );
    if (!currentQuestion) throw new Error('Question not found');

    // 3. Check if answer is correct and get explanation
    const isAnswerCorrect =
      args.selectedAlternativeIndex === currentQuestion.correctAlternativeIndex;

    // 4. Save answer and feedback for current question
    await ctx.db.patch(session._id, {
      answers: [...session.answers, args.selectedAlternativeIndex],
      answerFeedback: [
        ...session.answerFeedback,
        {
          isCorrect: isAnswerCorrect,
          explanation: currentQuestion.explanationText,
        },
      ],
      currentQuestionIndex: session.currentQuestionIndex + 1,
      isComplete: false,
    });

    return {
      isAnswerCorrect,
      feedback: isAnswerCorrect ? 'Correct!' : 'Incorrect',
      explanation: currentQuestion.explanationText,
      nextQuestionIndex: session.currentQuestionIndex + 1,
      isComplete: session.currentQuestionIndex + 1 >= quiz.questions.length,
    };
  },
});

// Add new mutation for explicitly completing the quiz
export const completeQuizSession = mutation({
  args: {
    quizId: v.union(v.id('presetQuizzes'), v.id('customQuizzes')),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);

    const session = await ctx.db
      .query('quizSessions')
      .withIndex('by_user_quiz', q =>
        q
          .eq('userId', userId._id)
          .eq('quizId', args.quizId)
          .eq('isComplete', false),
      )
      .first();

    if (!session) throw new Error('No active quiz session found');

    await ctx.db.patch(session._id, {
      isComplete: true,
    });

    return { success: true };
  },
});

// Add this new query function to list incomplete sessions for current user
export const listIncompleteSessions = query({
  args: {},
  handler: async ctx => {
    const userId = await getCurrentUserOrThrow(ctx);

    // Query for all incomplete sessions for this user
    const sessions = await ctx.db
      .query('quizSessions')
      .withIndex('by_user_quiz', q => q.eq('userId', userId._id))
      .filter(q => q.eq(q.field('isComplete'), false))
      .collect();

    return sessions;
  },
});
