/* eslint-disable playwright/no-useless-await */
import { v } from 'convex/values';

import { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';

const MOCK_USER_ID = 'j571n8n6pntprjpnv9w22th81n78fq8y' as Id<'users'>;

export const getCurrentSession = query({
  args: { quizId: v.union(v.id('presetQuizzes'), v.id('customQuizzes')) },
  handler: async (ctx, { quizId }) => {
    return ctx.db
      .query('quizSessions')
      .withIndex('by_user_quiz', q =>
        q
          .eq('userId', MOCK_USER_ID)
          .eq('quizId', quizId)
          .eq('isComplete', false),
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
    const sessionId = await ctx.db.insert('quizSessions', {
      userId: MOCK_USER_ID,
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
    selectedOptionIndex: v.union(
      v.literal(0),
      v.literal(1),
      v.literal(2),
      v.literal(3),
    ),
  },
  handler: async (ctx, args) => {
    // 1. Get current session
    const session = await ctx.db
      .query('quizSessions')
      .withIndex('by_user_quiz', q =>
        q
          .eq('userId', MOCK_USER_ID)
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
      args.selectedOptionIndex === currentQuestion.correctOptionIndex;

    // 4. Save answer and feedback for current question
    await ctx.db.patch(session._id, {
      answers: [...session.answers, args.selectedOptionIndex],
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
    const session = await ctx.db
      .query('quizSessions')
      .withIndex('by_user_quiz', q =>
        q
          .eq('userId', MOCK_USER_ID)
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
