import { v } from 'convex/values';

import { Id } from './_generated/dataModel';
import { query } from './_generated/server';
import * as aggregateHelpers from './aggregateHelpers';
import { getCurrentUserOrThrow } from './users';

/**
 * Count questions based on selection criteria using aggregates
 *
 * This function counts how many questions match the given criteria:
 * - question mode (all, unanswered, incorrect, bookmarked)
 * - selected themes, subthemes, and groups (filtering to be implemented)
 */
export const countSelectedQuestions = query({
  args: {
    questionMode: v.union(
      v.literal('all'),
      v.literal('unanswered'),
      v.literal('incorrect'),
      v.literal('bookmarked'),
    ),
    selectedThemes: v.optional(v.array(v.id('themes'))),
    selectedSubthemes: v.optional(v.array(v.id('subthemes'))),
    selectedGroups: v.optional(v.array(v.id('groups'))),
  },
  returns: v.object({ count: v.number() }),
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);
    let count = 0;

    // Use aggregate helpers for efficient counting
    switch (args.questionMode) {
      case 'all': {
        // Get total questions count using aggregate
        count = await aggregateHelpers.getTotalQuestionCount(ctx);
        break;
      }
      case 'unanswered': {
        // Get total and answered counts
        const [totalQuestions, answeredCount] = await Promise.all([
          aggregateHelpers.getTotalQuestionCount(ctx),
          aggregateHelpers.getUserAnsweredCount(ctx, userId._id),
        ]);

        // Unanswered = total - answered
        count = totalQuestions - answeredCount;
        break;
      }
      case 'incorrect': {
        // Get incorrect count directly from aggregate
        count = await aggregateHelpers.getUserIncorrectCount(ctx, userId._id);
        break;
      }
      case 'bookmarked': {
        // Get bookmarks count from aggregate
        count = await aggregateHelpers.getUserBookmarksCount(ctx, userId._id);
        break;
      }
    }

    // Theme/subtheme/group filtering will be implemented in a future update

    return { count };
  },
});
