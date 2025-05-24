import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import * as aggregateHelpers from './aggregateHelpers';

/*
 * This file contains functions for efficiently calculating statistics about questions
 * in the database, particularly counting the total number of questions.
 */

/**
 * Count the total number of questions in the database.
 * Uses the aggregate for efficient O(log n) counting.
 */
export const getTotalQuestionCount = query({
  args: {},
  handler: async ctx => {
    // Using aggregate for efficient counting
    return await aggregateHelpers.getTotalQuestionCount(ctx);
  },
});

/**
 * Count questions by theme.
 */
export const getThemeQuestionCount = query({
  args: {
    themeId: v.id('themes'),
  },
  handler: async (ctx, args) => {
    return await aggregateHelpers.getThemeQuestionCount(ctx, args.themeId);
  },
});

/**
 * Get a user's answered question count
 */
export const getUserAnsweredCount = query({
  args: {
    userId: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    // If userId not provided, use the current user
    let userId;
    if (args.userId) {
      userId = args.userId;
    } else {
      // Get current user - normally this would use your getCurrentUserOrThrow function
      // For now we'll just throw if userId not provided
      throw new Error('User ID required');
    }

    return await aggregateHelpers.getUserAnsweredCount(ctx, userId);
  },
});

/**
 * Get a user's incorrect answer count
 */
export const getUserIncorrectCount = query({
  args: {
    userId: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    // If userId not provided, use the current user
    let userId;
    if (args.userId) {
      userId = args.userId;
    } else {
      // Get current user - normally this would use your getCurrentUserOrThrow function
      // For now we'll just throw if userId not provided
      throw new Error('User ID required');
    }

    return await aggregateHelpers.getUserIncorrectCount(ctx, userId);
  },
});

/**
 * Get a user's bookmarks count
 */
export const getUserBookmarksCount = query({
  args: {
    userId: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    // If userId not provided, use the current user
    let userId;
    if (args.userId) {
      userId = args.userId;
    } else {
      // Get current user - normally this would use your getCurrentUserOrThrow function
      // For now we'll just throw if userId not provided
      throw new Error('User ID required');
    }

    return await aggregateHelpers.getUserBookmarksCount(ctx, userId);
  },
});

/**
 * This function can be called when a question is inserted to update statistics.
 * Currently a no-op as we're using the triggers system instead.
 */
export async function _updateQuestionStatsOnInsert(ctx: any, questionDoc: any) {
  // Not needed - using triggers
  return;
}

/**
 * This function can be called when a question is deleted to update statistics.
 * Currently a no-op as we're using the triggers system instead.
 */
export async function _updateQuestionStatsOnDelete(ctx: any, questionDoc: any) {
  // Not needed - using triggers
  return;
}

/**
 * Utility function to recalculate question statistics.
 */
export const recalculateQuestionStats = mutation({
  args: {},
  handler: async ctx => {
    // Not needed to implement here - using triggers.initializeAggregates instead
    return { success: true };
  },
});
