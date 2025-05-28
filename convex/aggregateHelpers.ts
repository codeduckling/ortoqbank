import { v } from 'convex/values';

import { api } from './_generated/api';
import { mutation, query } from './_generated/server';
import { questionCountByTheme, totalQuestionCount } from './aggregates';

/**
 * OPTIMIZED AGGREGATE HELPERS - NO MORE FULL TABLE SCANS!
 *
 * BEFORE: All functions used .collect() causing O(n) full table scans
 * AFTER: Using efficient strategies to avoid scanning entire tables:
 *
 * 1. TOTAL QUESTION COUNT:
 *    - OLD: ctx.db.query('questions').collect() → SCANS ALL QUESTIONS
 *    - NEW: totalQuestionCount.count() → O(log n) aggregate lookup
 *    - USES: Global aggregate with 'global' namespace
 *
 * 2. THEME QUESTION COUNT:
 *    - OLD: .withIndex().collect() → Could scan many rows
 *    - NEW: questionCountByTheme.count() → O(log n) aggregate lookup
 *    - FALLBACK: Efficient index scan for reliability
 *
 * 3. USER STATS (answered, incorrect, bookmarks):
 *    - OLD: .filter().collect() → FULL TABLE SCANS
 *    - NEW: .withIndex().collect() → INDEX SCANS only relevant user data
 *    - Uses by_user, by_user_answered, by_user_incorrect indexes
 *
 * PERFORMANCE IMPACT:
 * - Total questions: O(n) → O(log n) with global aggregate
 * - Theme questions: O(n) → O(log n) with theme aggregate
 * - User stats: O(n) → O(user_data) where user_data << total_data
 *
 * This eliminates full table scans that could scan thousands of irrelevant rows!
 */

// Query function to get total question count using aggregate - MOST EFFICIENT
export const getTotalQuestionCountQuery = query({
  args: {},
  returns: v.number(),
  handler: async ctx => {
    // Use the totalQuestionCount aggregate for O(log n) counting
    // This is the most efficient way to count all questions
    const count = await totalQuestionCount.count(ctx, {
      namespace: 'global',
      bounds: {},
    });
    return count;
  },
});

// Query function to get theme question count using proven aggregate
export const getThemeQuestionCountQuery = query({
  args: {
    themeId: v.id('themes'),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    // Use the working aggregate pattern from questions.ts
    try {
      const count = await questionCountByTheme.count(ctx, {
        namespace: args.themeId,
        bounds: {},
      });
      return count;
    } catch (error) {
      console.warn(`Aggregate failed for theme ${args.themeId}:`, error);
      // Fallback to efficient index-based query
      const questions = await ctx.db
        .query('questions')
        .withIndex('by_theme', q => q.eq('themeId', args.themeId))
        .collect();
      return questions.length;
    }
  },
});

// Query function to get user answer count - optimized with index
export const getUserAnsweredCountQuery = query({
  args: {
    userId: v.id('users'),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    // Use efficient index scan instead of .collect() on full table
    const stats = await ctx.db
      .query('userQuestionStats')
      .withIndex('by_user_answered', q =>
        q.eq('userId', args.userId).eq('hasAnswered', true),
      )
      .collect();
    return stats.length;
  },
});

// Query function to get user incorrect count - optimized with index
export const getUserIncorrectCountQuery = query({
  args: {
    userId: v.id('users'),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    // Use efficient index scan instead of .collect() on full table
    const stats = await ctx.db
      .query('userQuestionStats')
      .withIndex('by_user_incorrect', q =>
        q.eq('userId', args.userId).eq('isIncorrect', true),
      )
      .collect();
    return stats.length;
  },
});

// Query function to get user bookmarks count - optimized with index
export const getUserBookmarksCountQuery = query({
  args: {
    userId: v.id('users'),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    // Use efficient index scan instead of .collect() on full table
    const bookmarks = await ctx.db
      .query('userBookmarks')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .collect();
    return bookmarks.length;
  },
});

// Helper functions that call these queries
export async function getTotalQuestionCount(ctx: any): Promise<number> {
  return await ctx.runQuery(api.aggregateHelpers.getTotalQuestionCountQuery);
}

export async function getThemeQuestionCount(
  ctx: any,
  themeId: any,
): Promise<number> {
  return await ctx.runQuery(api.aggregateHelpers.getThemeQuestionCountQuery, {
    themeId,
  });
}

export async function getUserAnsweredCount(
  ctx: any,
  userId: any,
): Promise<number> {
  return await ctx.runQuery(api.aggregateHelpers.getUserAnsweredCountQuery, {
    userId,
  });
}

export async function getUserIncorrectCount(
  ctx: any,
  userId: any,
): Promise<number> {
  return await ctx.runQuery(api.aggregateHelpers.getUserIncorrectCountQuery, {
    userId,
  });
}

export async function getUserBookmarksCount(
  ctx: any,
  userId: any,
): Promise<number> {
  return await ctx.runQuery(api.aggregateHelpers.getUserBookmarksCountQuery, {
    userId,
  });
}

// Repair function for totalQuestionCount aggregate
export const repairTotalQuestionCount = mutation({
  args: {},
  returns: v.null(),
  handler: async ctx => {
    console.log('Starting totalQuestionCount aggregate repair...');

    // Clear and rebuild the aggregate
    await totalQuestionCount.clear(ctx, { namespace: 'global' });
    console.log('Cleared existing totalQuestionCount aggregate');

    // Get all questions and insert them into the aggregate
    const allQuestions = await ctx.db.query('questions').collect();
    console.log(`Found ${allQuestions.length} questions to process`);

    for (const question of allQuestions) {
      await totalQuestionCount.insertIfDoesNotExist(ctx, question);
    }

    // Verify the count
    const finalCount = await totalQuestionCount.count(ctx, {
      namespace: 'global',
      bounds: {},
    });

    console.log(`Repair completed! Final aggregate count: ${finalCount}`);
    return;
  },
});

// Repair function for questionCountByTheme aggregate
export const repairQuestionCountByTheme = mutation({
  args: {},
  returns: v.null(),
  handler: async ctx => {
    console.log('Starting questionCountByTheme aggregate repair...');

    // Note: We skip clearing the aggregate since it requires a specific namespace
    // Instead we'll just ensure all questions are properly inserted
    console.log('Rebuilding questionCountByTheme aggregate...');

    // Get all questions with themes and insert them
    const allQuestions = await ctx.db.query('questions').collect();
    let processedCount = 0;

    for (const question of allQuestions) {
      if (question.themeId) {
        await questionCountByTheme.insertIfDoesNotExist(ctx, question);
        processedCount++;
      }
    }

    console.log(
      `Repair completed! Processed ${processedCount} questions with themes.`,
    );
    return;
  },
});

// Combined repair function for all aggregates
export const repairAllAggregates = mutation({
  args: {},
  returns: v.null(),
  handler: async ctx => {
    console.log('Starting repair of all question-related aggregates...');

    await ctx.runMutation(api.aggregateHelpers.repairTotalQuestionCount);
    await ctx.runMutation(api.aggregateHelpers.repairQuestionCountByTheme);

    console.log('All aggregate repairs completed!');
    return;
  },
});
