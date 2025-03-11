import { v } from 'convex/values';

import { api } from './_generated/api';
import { Doc, Id } from './_generated/dataModel';
import { internalMutation, query } from './_generated/server';
import { getCurrentUserOrThrow } from './users';

type UserStats = {
  overall: {
    totalAnswered: number;
    totalCorrect: number;
    totalIncorrect: number;
    totalBookmarked: number;
    correctPercentage: number;
  };
  byTheme: {
    themeId: Id<'themes'>;
    themeName: string;
    total: number;
    correct: number;
    percentage: number;
  }[];
  totalQuestions: number;
};

/**
 * Get user statistics from the persistent userQuestionStats table
 */
export const getUserStatsFromTable = query({
  args: {},
  handler: async (ctx): Promise<UserStats> => {
    const userId = await getCurrentUserOrThrow(ctx);

    // Get all user question stats
    const questionStats = await ctx.db
      .query('userQuestionStats')
      .withIndex('by_user', q => q.eq('userId', userId._id))
      .collect();

    // Get all bookmarks
    const bookmarks = await ctx.db
      .query('userBookmarks')
      .withIndex('by_user', q => q.eq('userId', userId._id))
      .collect();

    // Count stats
    const totalAnswered = questionStats.filter(stat => stat.hasAnswered).length;
    const totalIncorrect = questionStats.filter(
      stat => stat.isIncorrect,
    ).length;
    const totalCorrect = totalAnswered - totalIncorrect;
    const totalBookmarked = bookmarks.length;

    // Get total questions count using aggregate
    const totalQuestions = await ctx.runQuery(
      api.questionStats.getTotalQuestionCount,
      {},
    );

    // Get theme data
    const questionsWithThemes = await Promise.all(
      questionStats.map(async stat => {
        const question = await ctx.db.get(stat.questionId);
        if (!question) return;

        return {
          questionId: stat.questionId,
          themeId: question.themeId,
          isCorrect: !stat.isIncorrect && stat.hasAnswered,
        };
      }),
    );

    // Filter out undefined (deleted questions)
    const validQuestionsWithThemes = questionsWithThemes.filter(
      (q): q is NonNullable<typeof q> => q !== undefined,
    );

    // Calculate stats by theme
    const themeStatsMap = new Map<
      Id<'themes'>,
      { total: number; correct: number; themeName: string }
    >();

    // Process each question
    for (const question of validQuestionsWithThemes) {
      const theme = await ctx.db.get(question.themeId);
      if (!theme) continue;

      const themeId = question.themeId;
      const themeName = theme.name;

      if (!themeStatsMap.has(themeId)) {
        themeStatsMap.set(themeId, {
          total: 0,
          correct: 0,
          themeName,
        });
      }

      const themeStats = themeStatsMap.get(themeId)!;
      themeStats.total++;

      if (question.isCorrect) {
        themeStats.correct++;
      }
    }

    // Convert Map to array for easier handling in frontend
    const themeStats = [...themeStatsMap]
      .map(([themeId, stats]) => ({
        themeId,
        themeName: stats.themeName,
        total: stats.total,
        correct: stats.correct,
        percentage:
          stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    return {
      overall: {
        totalAnswered,
        totalCorrect,
        totalIncorrect,
        totalBookmarked,
        correctPercentage:
          totalAnswered > 0
            ? Math.round((totalCorrect / totalAnswered) * 100)
            : 0,
      },
      byTheme: themeStats,
      totalQuestions,
    };
  },
});

/**
 * Internal mutation to update question statistics when a user answers a question
 * This should only be called from the quizSessions.submitAnswerAndProgress function
 */
export const _updateQuestionStats = internalMutation({
  args: {
    questionId: v.id('questions'),
    isCorrect: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);
    const now = Date.now();

    // Check if we already have a record for this user and question
    const existingStat = await ctx.db
      .query('userQuestionStats')
      .withIndex('by_user_question', q =>
        q.eq('userId', userId._id).eq('questionId', args.questionId),
      )
      .first();

    if (existingStat) {
      // Update existing record
      if (args.isCorrect && existingStat.isIncorrect) {
        // If the question was previously incorrect but is now correct,
        // update the record to show it's no longer incorrect
        await ctx.db.patch(existingStat._id, {
          isIncorrect: false,
          answeredAt: now,
        });
      } else if (args.isCorrect) {
        // Just update the timestamp
        await ctx.db.patch(existingStat._id, {
          answeredAt: now,
        });
      } else {
        // If the answer is incorrect, mark it as incorrect
        await ctx.db.patch(existingStat._id, {
          isIncorrect: true,
          answeredAt: now,
        });
      }

      return { success: true, action: 'updated' };
    } else {
      // Create a new record
      await ctx.db.insert('userQuestionStats', {
        userId: userId._id,
        questionId: args.questionId,
        hasAnswered: true,
        isIncorrect: !args.isCorrect,
        answeredAt: now,
      });

      return { success: true, action: 'created' };
    }
  },
});

/**
 * Get questions that the user has answered incorrectly
 */
export const getIncorrectlyAnsweredQuestions = query({
  args: {},
  handler: async ctx => {
    const userId = await getCurrentUserOrThrow(ctx);

    // Get all incorrectly answered questions
    const incorrectStats = await ctx.db
      .query('userQuestionStats')
      .withIndex('by_user_incorrect', q =>
        q.eq('userId', userId._id).eq('isIncorrect', true),
      )
      .collect();

    if (incorrectStats.length === 0) {
      return [];
    }

    // Get the full question data
    const questionIds = incorrectStats.map(stat => stat.questionId);
    const questionsPromises = questionIds.map(id => ctx.db.get(id));
    const questions = await Promise.all(questionsPromises);

    // Filter out any null results (deleted questions)
    return questions.filter(q => q !== null);
  },
});

/**
 * Get questions that the user has answered at least once
 */
export const getAnsweredQuestions = query({
  args: {},
  handler: async ctx => {
    const userId = await getCurrentUserOrThrow(ctx);

    // Get all answered questions
    const answeredStats = await ctx.db
      .query('userQuestionStats')
      .withIndex('by_user_answered', q =>
        q.eq('userId', userId._id).eq('hasAnswered', true),
      )
      .collect();

    if (answeredStats.length === 0) {
      return [];
    }

    // Get the full question data
    const questionIds = answeredStats.map(stat => stat.questionId);
    const questionsPromises = questionIds.map(id => ctx.db.get(id));
    const questions = await Promise.all(questionsPromises);

    // Filter out any null results (deleted questions)
    return questions.filter(q => q !== null);
  },
});

/**
 * Check if a specific question has been answered and/or incorrectly answered by the user
 */
export const getQuestionStatus = query({
  args: {
    questionId: v.id('questions'),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);

    const stat = await ctx.db
      .query('userQuestionStats')
      .withIndex('by_user_question', q =>
        q.eq('userId', userId._id).eq('questionId', args.questionId),
      )
      .first();

    // Check bookmark status
    const bookmark = await ctx.db
      .query('userBookmarks')
      .withIndex('by_user_question', q =>
        q.eq('userId', userId._id).eq('questionId', args.questionId),
      )
      .first();

    return {
      hasAnswered: stat ? stat.hasAnswered : false,
      isIncorrect: stat ? stat.isIncorrect : false,
      isBookmarked: !!bookmark,
      answeredAt: stat ? stat.answeredAt : undefined,
    };
  },
});
