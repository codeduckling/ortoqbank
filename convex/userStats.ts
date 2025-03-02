import { v } from 'convex/values';
import { query } from './_generated/server';
import { getCurrentUserOrThrow } from './users';

/**
 * Get overall user statistics for completed quizzes
 */
export const getUserStats = query({
  args: {},
  handler: async ctx => {
    const userId = await getCurrentUserOrThrow(ctx);

    // Get all completed sessions
    const completedSessions = await ctx.db
      .query('quizSessions')
      .withIndex('by_user_quiz', q => q.eq('userId', userId._id))
      .filter(q => q.eq(q.field('isComplete'), true))
      .collect();

    // Initialize stats
    const stats = {
      totalAnswered: 0,
      totalCorrect: 0,
      totalIncorrect: 0,
      totalQuestions: 0,
      answersByTheme: new Map<
        string,
        { total: number; correct: number; themeName: string }
      >(),
    };

    // Process each session
    for (const session of completedSessions) {
      // Get the quiz to access questions
      const quiz = await ctx.db.get(session.quizId);
      if (!quiz || !quiz.questions) continue;

      // Track the total questions encountered
      stats.totalQuestions += quiz.questions.length;

      // Process each question in this session
      for (let i = 0; i < session.answers.length; i++) {
        stats.totalAnswered++;

        // Check if the answer was correct
        const feedback = session.answerFeedback[i];
        if (feedback?.isCorrect) {
          stats.totalCorrect++;
        } else {
          stats.totalIncorrect++;
        }

        // Get the question for theme info
        if (i < quiz.questions.length) {
          const questionId = quiz.questions[i];
          const question = await ctx.db.get(questionId);

          if (question) {
            // Get the theme info
            const theme = await ctx.db.get(question.themeId);
            if (theme) {
              const themeId = question.themeId;
              const themeName = theme.name;

              // Update theme stats
              if (!stats.answersByTheme.has(themeId)) {
                stats.answersByTheme.set(themeId, {
                  total: 0,
                  correct: 0,
                  themeName,
                });
              }

              const themeStats = stats.answersByTheme.get(themeId)!;
              themeStats.total++;

              if (feedback?.isCorrect) {
                themeStats.correct++;
              }
            }
          }
        }
      }
    }

    // Convert Map to array for easier handling in frontend
    const themeStats = Array.from(stats.answersByTheme.entries())
      .map(([themeId, stats]) => ({
        themeId,
        themeName: stats.themeName,
        total: stats.total,
        correct: stats.correct,
        percentage:
          stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total); // Sort by most questions answered

    return {
      overall: {
        totalAnswered: stats.totalAnswered,
        totalQuestions: stats.totalQuestions,
        totalUnanswered: stats.totalQuestions - stats.totalAnswered,
        totalCorrect: stats.totalCorrect,
        totalIncorrect: stats.totalIncorrect,
        correctPercentage:
          stats.totalAnswered > 0
            ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
            : 0,
      },
      byTheme: themeStats,
    };
  },
});
