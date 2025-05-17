import { v } from 'convex/values';

import { api } from './_generated/api';
import { query } from './_generated/server';

/**
 * Wrapper functions that use direct Convex queries to avoid type issues
 */

// Query function to get total question count
export const getTotalQuestionCountQuery = query({
  args: {},
  returns: v.number(),
  handler: async ctx => {
    // Fallback to direct count if aggregates not functioning
    const questions = await ctx.db.query('questions').collect();
    return questions.length;
  },
});

// Query function to get theme question count
export const getThemeQuestionCountQuery = query({
  args: {
    themeId: v.id('themes'),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    // Fallback to direct count if aggregates not functioning
    const questions = await ctx.db
      .query('questions')
      .withIndex('by_theme', q => q.eq('themeId', args.themeId))
      .collect();
    return questions.length;
  },
});

// Query function to get user answer count
export const getUserAnsweredCountQuery = query({
  args: {
    userId: v.id('users'),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    // Count answered questions for user
    const stats = await ctx.db
      .query('userQuestionStats')
      .withIndex('by_user_answered', q =>
        q.eq('userId', args.userId).eq('hasAnswered', true),
      )
      .collect();
    return stats.length;
  },
});

// Query function to get user incorrect count
export const getUserIncorrectCountQuery = query({
  args: {
    userId: v.id('users'),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    // Count incorrect answers for user
    const stats = await ctx.db
      .query('userQuestionStats')
      .withIndex('by_user_incorrect', q =>
        q.eq('userId', args.userId).eq('isIncorrect', true),
      )
      .collect();
    return stats.length;
  },
});

// Query function to get user bookmarks count
export const getUserBookmarksCountQuery = query({
  args: {
    userId: v.id('users'),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    // Count bookmarks for user
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
