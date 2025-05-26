import { v } from 'convex/values';

import { api } from './_generated/api';
import { Doc, Id } from './_generated/dataModel';
import { query } from './_generated/server';
import { getCurrentUserOrThrow } from './users';

/**
 * Resolves user filter selections to a final set of groupIds using Set for deduplication.
 * Handles the hierarchy: themes → subthemes → groups
 * More specific filters override broader ones within the same branch.
 */
async function resolveFiltersToGroupIds(
  ctx: any,
  filters: {
    selectedThemes?: Id<'themes'>[];
    selectedSubthemes?: Id<'subthemes'>[];
    selectedGroups?: Id<'groups'>[];
  },
): Promise<Id<'groups'>[]> {
  const finalGroupIds = new Set<Id<'groups'>>();

  // 1. Add directly selected groups (most specific)
  if (filters.selectedGroups?.length) {
    filters.selectedGroups.forEach(id => finalGroupIds.add(id));
  }

  // 2. Expand subthemes to groups (optimized with single query)
  if (filters.selectedSubthemes?.length) {
    const groups = await ctx.db
      .query('groups')
      .filter((q: any) =>
        q.or(
          ...filters.selectedSubthemes!.map(subthemeId =>
            q.eq(q.field('subthemeId'), subthemeId),
          ),
        ),
      )
      .collect();
    groups.forEach((group: any) => finalGroupIds.add(group._id));
  }

  // 3. Expand themes to groups (through subthemes) - optimized
  if (filters.selectedThemes?.length) {
    // Get all subthemes for selected themes in one query
    const subthemes = await ctx.db
      .query('subthemes')
      .filter((q: any) =>
        q.or(
          ...filters.selectedThemes!.map(themeId =>
            q.eq(q.field('themeId'), themeId),
          ),
        ),
      )
      .collect();

    // Get all groups for these subthemes in one query
    if (subthemes.length > 0) {
      const groups = await ctx.db
        .query('groups')
        .filter((q: any) =>
          q.or(
            ...subthemes.map((subtheme: any) =>
              q.eq(q.field('subthemeId'), subtheme._id),
            ),
          ),
        )
        .collect();
      groups.forEach((group: any) => finalGroupIds.add(group._id));
    }
  }

  return [...finalGroupIds];
}

/**
 * Gets all questions that match the resolved groupIds.
 * Uses a single query with .or() filter for better performance.
 * Handles the fact that groupId is optional in questions table.
 */
async function getQuestionsFromGroupIds(
  ctx: any,
  groupIds: Id<'groups'>[],
): Promise<Doc<'questions'>[]> {
  if (groupIds.length === 0) {
    return [];
  }

  // Use a single query with .or() filter instead of multiple queries
  // This is much more efficient according to Convex best practices
  const questions = await ctx.db
    .query('questions')
    .filter((q: any) =>
      q.or(...groupIds.map(groupId => q.eq(q.field('groupId'), groupId))),
    )
    .collect();

  return questions;
}

/**
 * Applies question mode filter to a set of questions.
 * Handles user-specific filters like bookmarked, incorrect, unanswered.
 */
async function applyQuestionModeFilter(
  ctx: any,
  questions: Doc<'questions'>[],
  questionMode: 'all' | 'unanswered' | 'incorrect' | 'bookmarked',
  userId: Id<'users'>,
): Promise<Doc<'questions'>[]> {
  switch (questionMode) {
    case 'all': {
      return questions;
    }

    case 'bookmarked': {
      // Get user's bookmarks
      const bookmarks = await ctx.db
        .query('userBookmarks')
        .withIndex('by_user', (q: any) => q.eq('userId', userId))
        .collect();

      const bookmarkedIds = new Set(bookmarks.map((b: any) => b.questionId));
      return questions.filter((q: any) => bookmarkedIds.has(q._id));
    }

    case 'incorrect': {
      // Get user's incorrect answers
      const incorrectStats = await ctx.db
        .query('userQuestionStats')
        .withIndex('by_user_incorrect', (q: any) =>
          q.eq('userId', userId).eq('isIncorrect', true),
        )
        .collect();

      const incorrectIds = new Set(
        incorrectStats.map((s: any) => s.questionId),
      );
      return questions.filter((q: any) => incorrectIds.has(q._id));
    }

    case 'unanswered': {
      // Get user's answered questions
      const answeredStats = await ctx.db
        .query('userQuestionStats')
        .withIndex('by_user_answered', (q: any) =>
          q.eq('userId', userId).eq('hasAnswered', true),
        )
        .collect();

      const answeredIds = new Set(answeredStats.map((s: any) => s.questionId));
      return questions.filter((q: any) => !answeredIds.has(q._id));
    }

    default: {
      return questions;
    }
  }
}

/**
 * Live count query that provides real-time question count based on user filters.
 * This is called every time the user changes filters in the UI.
 */
export const getLiveQuestionCount = query({
  args: {
    questionMode: v.union(
      v.literal('all'),
      v.literal('unanswered'),
      v.literal('incorrect'),
      v.literal('bookmarked'),
    ),
    selectedThemes: v.array(v.string()),
    selectedSubthemes: v.array(v.string()),
    selectedGroups: v.array(v.string()),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);

    // Convert string IDs to Convex IDs
    const filters = {
      selectedThemes: args.selectedThemes.map(id => id as Id<'themes'>),
      selectedSubthemes: args.selectedSubthemes.map(
        id => id as Id<'subthemes'>,
      ),
      selectedGroups: args.selectedGroups.map(id => id as Id<'groups'>),
    };

    // Handle case where no filters are selected - use aggregation for count
    if (
      filters.selectedThemes.length === 0 &&
      filters.selectedSubthemes.length === 0 &&
      filters.selectedGroups.length === 0
    ) {
      // For "all" mode, we can use a simple count without loading all questions
      if (args.questionMode === 'all') {
        // Use the existing aggregate helper for total count
        const totalCount: number = await ctx.runQuery(
          api.aggregateHelpers.getTotalQuestionCountQuery,
          {},
        );
        return totalCount;
      }

      // For other modes, we need to count based on user stats without loading all questions
      switch (args.questionMode) {
        case 'bookmarked': {
          const bookmarkCount: number = await ctx.runQuery(
            api.aggregateHelpers.getUserBookmarksCountQuery,
            { userId: userId._id },
          );
          return bookmarkCount;
        }
        case 'incorrect': {
          const incorrectCount: number = await ctx.runQuery(
            api.aggregateHelpers.getUserIncorrectCountQuery,
            { userId: userId._id },
          );
          return incorrectCount;
        }
        case 'unanswered': {
          const totalCount: number = await ctx.runQuery(
            api.aggregateHelpers.getTotalQuestionCountQuery,
            {},
          );
          const answeredCount: number = await ctx.runQuery(
            api.aggregateHelpers.getUserAnsweredCountQuery,
            { userId: userId._id },
          );
          return Math.max(0, totalCount - answeredCount);
        }
        default: {
          return 0;
        }
      }
    }

    // Resolve filters to final group IDs
    const finalGroupIds = await resolveFiltersToGroupIds(ctx, filters);

    // If no groups resolved, return 0
    if (finalGroupIds.length === 0) {
      return 0;
    }

    // Get questions from the resolved groups
    const questions = await getQuestionsFromGroupIds(ctx, finalGroupIds);

    // Apply question mode filter
    const filteredQuestions = await applyQuestionModeFilter(
      ctx,
      questions,
      args.questionMode,
      userId._id,
    );

    return filteredQuestions.length;
  },
});

/**
 * Debug query to see the resolved group IDs for testing purposes.
 * Useful for understanding how filters are being resolved.
 */
export const debugFilterResolution = query({
  args: {
    selectedThemes: v.array(v.string()),
    selectedSubthemes: v.array(v.string()),
    selectedGroups: v.array(v.string()),
  },
  returns: v.object({
    finalGroupIds: v.array(v.string()),
    groupCount: v.number(),
    filterSummary: v.object({
      themesSelected: v.number(),
      subthemesSelected: v.number(),
      groupsSelected: v.number(),
    }),
  }),
  handler: async (ctx, args) => {
    // Convert string IDs to Convex IDs
    const filters = {
      selectedThemes: args.selectedThemes.map(id => id as Id<'themes'>),
      selectedSubthemes: args.selectedSubthemes.map(
        id => id as Id<'subthemes'>,
      ),
      selectedGroups: args.selectedGroups.map(id => id as Id<'groups'>),
    };

    // Resolve filters to final group IDs
    const finalGroupIds = await resolveFiltersToGroupIds(ctx, filters);

    return {
      finalGroupIds: finalGroupIds.map(id => id.toString()),
      groupCount: finalGroupIds.length,
      filterSummary: {
        themesSelected: filters.selectedThemes.length,
        subthemesSelected: filters.selectedSubthemes.length,
        groupsSelected: filters.selectedGroups.length,
      },
    };
  },
});

/**
 * Export the helper functions for use in other files if needed
 */
export {
  applyQuestionModeFilter,
  getQuestionsFromGroupIds,
  resolveFiltersToGroupIds,
};
