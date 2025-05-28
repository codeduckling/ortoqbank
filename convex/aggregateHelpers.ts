import { v } from 'convex/values';

import { api } from './_generated/api';
import { query } from './_generated/server';
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
