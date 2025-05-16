import { paginationOptsValidator } from 'convex/server';
// Import context types from convex/server
import { GenericMutationCtx, GenericQueryCtx } from 'convex/server';
import { v } from 'convex/values';

import { api, internal } from './_generated/api';
import { DataModel, Doc, Id } from './_generated/dataModel';
import {
  // Keep these for defining the actual mutations/queries
  internalAction,
  internalMutation,
  mutation,
  query,
} from './_generated/server';
import { questionCountByThemeAggregate } from './questionCountByTheme';
import {
  _updateQuestionStatsOnDelete,
  _updateQuestionStatsOnInsert,
} from './questionStats';

/**
 * CONTENT MIGRATION STATUS: COMPLETED
 *
 * All TipTap editor content has been migrated from object format to string format.
 * New questions now only store content in the string fields:
 * - `questionTextString` (required)
 * - `explanationTextString` (required)
 *
 * Legacy fields `questionText` and `explanationText` are now optional in the schema
 * and are no longer stored for new questions. They are kept for backward compatibility
 * with existing data.
 *
 * API MUTATION UPDATES:
 * - The `create` and `update` mutations now accept string parameters directly:
 *   - `questionTextString` instead of `questionText`
 *   - `explanationTextString` instead of `explanationText`
 * - This ensures all new content is stored only in string format
 *
 * All components should use the string fields when rendering content.
 */

// ---------- Helper Functions for Question CRUD + Aggregate Sync ----------

// Use GenericMutationCtx with DataModel
async function _internalInsertQuestion(
  ctx: GenericMutationCtx<DataModel>,
  data: Omit<Doc<'questions'>, '_id' | '_creationTime'>,
) {
  const questionId = await ctx.db.insert('questions', data);
  const questionDoc = (await ctx.db.get(questionId))!;
  await questionCountByThemeAggregate.insert(ctx, questionDoc);
  // Also update the other aggregate if needed
  await _updateQuestionStatsOnInsert(ctx, questionDoc);
  return questionId;
}

async function _internalUpdateQuestion(
  ctx: GenericMutationCtx<DataModel>,
  id: Id<'questions'>,
  updates: Partial<Doc<'questions'>>,
) {
  const oldQuestionDoc = await ctx.db.get(id);
  if (!oldQuestionDoc) {
    throw new Error(`Question not found for update: ${id}`);
  }
  await ctx.db.patch(id, updates);
  const newQuestionDoc = (await ctx.db.get(id))!;
  await questionCountByThemeAggregate.replace(
    ctx,
    oldQuestionDoc,
    newQuestionDoc,
  );
  // Note: Add update logic for _updateQuestionStats if needed here as well
}

async function _internalDeleteQuestion(
  ctx: GenericMutationCtx<DataModel>,
  id: Id<'questions'>,
) {
  const questionDoc = await ctx.db.get(id);
  if (!questionDoc) {
    console.warn(`Question not found for deletion: ${id}`);
    return false; // Indicate deletion didn't happen
  }
  await ctx.db.delete(id);
  await questionCountByThemeAggregate.delete(ctx, questionDoc);
  // Also update the other aggregate
  await _updateQuestionStatsOnDelete(ctx, questionDoc);
  return true; // Indicate successful deletion
}

// -----------------------------------------------------------------------

const validateNoBlobs = (content: any[]) => {
  for (const node of content) {
    if (node.type === 'image' && node.attrs?.src?.startsWith('blob:')) {
      throw new Error('Invalid image URL detected');
    }
  }
};

// Helper function to stringify content if it's an object
function stringifyContent(content: any): string {
  if (typeof content === 'string') {
    return content; // Already a string
  }
  return JSON.stringify(content);
}

export const create = mutation({
  args: {
    // Accept string content directly instead of objects
    questionTextString: v.string(),
    explanationTextString: v.string(),
    questionCode: v.optional(v.string()),
    title: v.string(),
    alternatives: v.array(v.string()),
    correctAlternativeIndex: v.number(),
    themeId: v.id('themes'),
    subthemeId: v.optional(v.id('subthemes')),
    groupId: v.optional(v.id('groups')),
  },
  handler: async (ctx, args) => {
    // Validate JSON structure of string content
    try {
      const questionTextObj = JSON.parse(args.questionTextString);
      const explanationTextObj = JSON.parse(args.explanationTextString);

      // Validate structure after parsing
      if (questionTextObj.content) {
        validateNoBlobs(questionTextObj.content);
      }
      if (explanationTextObj.content) {
        validateNoBlobs(explanationTextObj.content);
      }
    } catch (error: any) {
      throw new Error(
        'Invalid content format: ' + (error.message || 'Unknown error'),
      );
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkUserId', q => q.eq('clerkUserId', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');

    // Prepare data and call the internal helper
    const questionData = {
      ...args,
      // Set migration flag
      contentMigrated: true,
      normalizedTitle: args.title.trim().toLowerCase(),
      authorId: user._id,
      isPublic: false, // Default value
    };

    // Use the helper function
    const questionId = await _internalInsertQuestion(ctx, questionData);
    return questionId;
  },
});

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (context, arguments_) => {
    const questions = await context.db
      .query('questions')
      .order('desc')
      .paginate(arguments_.paginationOpts);

    // Only fetch themes for the current page of questions, not all themes
    const themes = await Promise.all(
      questions.page.map(question => context.db.get(question.themeId)),
    );

    return {
      ...questions,
      page: questions.page.map((question, index) => ({
        ...question,
        theme: themes[index],
      })),
    };
  },
});

export const getById = query({
  args: { id: v.id('questions') },
  handler: async (context, arguments_) => {
    const question = await context.db.get(arguments_.id);
    if (!question) {
      throw new Error('Question not found');
    }

    const theme = await context.db.get(question.themeId);

    const subtheme = question.subthemeId
      ? await context.db.get(question.subthemeId)
      : undefined;

    /**
     * IMPORTANT: For all new code, use the string format fields:
     * - `questionTextString` instead of `questionText`
     * - `explanationTextString` instead of `explanationText`
     *
     * The object fields are kept for backward compatibility.
     */
    return {
      ...question,
      theme,
      subtheme,
    };
  },
});

export const update = mutation({
  args: {
    id: v.id('questions'),
    // Accept string content directly
    questionTextString: v.string(),
    explanationTextString: v.string(),
    questionCode: v.optional(v.string()),
    title: v.string(),
    alternatives: v.array(v.string()),
    correctAlternativeIndex: v.number(),
    themeId: v.id('themes'),
    subthemeId: v.optional(v.id('subthemes')),
    groupId: v.optional(v.id('groups')),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Validate JSON structure of string content
    try {
      const questionTextObj = JSON.parse(args.questionTextString);
      const explanationTextObj = JSON.parse(args.explanationTextString);

      // Validate structure after parsing
      if (questionTextObj.content) {
        validateNoBlobs(questionTextObj.content);
      }
      if (explanationTextObj.content) {
        validateNoBlobs(explanationTextObj.content);
      }
    } catch (error: any) {
      throw new Error(
        'Invalid content format: ' + (error.message || 'Unknown error'),
      );
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    // Don't need to check if question exists here, helper does it

    const { id, ...otherFields } = args;

    // Prepare update data
    const updates = {
      ...otherFields,
      // Set migration flag
      contentMigrated: true,
      normalizedTitle: args.title?.trim().toLowerCase(), // Handle optional title in updates
    };

    // Use the helper function
    await _internalUpdateQuestion(ctx, id, updates);

    return true; // Indicate success
  },
});

export const listAll = query({
  // WARNING: This query downloads the entire questions table and should be avoided in production
  // or with large datasets as it will consume significant bandwidth.
  // Consider using paginated queries (like 'list') or filtering server-side instead.
  handler: async context => {
    return await context.db.query('questions').collect();
  },
});

export const getMany = query({
  args: { ids: v.array(v.id('questions')) },
  handler: async (ctx, args) => {
    const questions = await Promise.all(args.ids.map(id => ctx.db.get(id)));
    return questions;
  },
});

export const countQuestionsByMode = query({
  args: {
    questionMode: v.union(
      v.literal('all'),
      v.literal('unanswered'),
      v.literal('incorrect'),
      v.literal('bookmarked'),
    ),
  },
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkUserId', q => q.eq('clerkUserId', identity.subject))
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    const totalQuestions = await ctx.db.query('questions').collect();
    const totalCount = totalQuestions.length;

    const result = {
      all: totalCount,
      unanswered: 0,
      incorrect: 0,
      bookmarked: 0,
    };

    const incorrectStats = await ctx.db
      .query('userQuestionStats')
      .withIndex('by_user_incorrect', q =>
        q.eq('userId', user._id).eq('isIncorrect', true),
      )
      .collect();
    result.incorrect = incorrectStats.length;

    const bookmarks = await ctx.db
      .query('userBookmarks')
      .withIndex('by_user', q => q.eq('userId', user._id))
      .collect();
    result.bookmarked = bookmarks.length;

    const answeredStats = await ctx.db
      .query('userQuestionStats')
      .withIndex('by_user_answered', q =>
        q.eq('userId', user._id).eq('hasAnswered', true),
      )
      .collect();
    result.unanswered = totalCount - answeredStats.length;

    return result;
  },
});

export const getQuestionCountForTheme = query({
  args: { themeId: v.id('themes') },
  handler: async (ctx, args) => {
    const count = await questionCountByThemeAggregate.count(ctx, {
      namespace: args.themeId,
      bounds: {},
    });
    return count;
  },
});

export const countAvailableQuestionsEfficient = query({
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
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return;
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkUserId', q => q.eq('clerkUserId', identity.subject))
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    // Calculate the total count based on themes
    let totalCount = 0;

    // If themes are selected, sum the counts from the aggregate
    if (args.selectedThemes && args.selectedThemes.length > 0) {
      // Use the aggregate to get counts for each selected theme
      const themeCounts = await Promise.all(
        args.selectedThemes.map(themeId =>
          questionCountByThemeAggregate.count(ctx, {
            namespace: themeId,
            bounds: {},
          }),
        ),
      );

      // Sum up all theme counts
      totalCount = themeCounts.reduce((sum, count) => sum + count, 0);
    } else {
      // If no themes selected, get the total count of all questions
      // This is more efficient than querying the entire table
      const questions = await ctx.db.query('questions').collect();
      totalCount = questions.length;
    }

    // For subtheme and group filtering, we still need to do some filtering
    // since the aggregate is only by theme
    let filteredCount = totalCount;

    // If we need to filter by subtheme or group, we need to query the questions
    const needsDetailedFiltering =
      (args.selectedSubthemes && args.selectedSubthemes.length > 0) ||
      (args.selectedGroups && args.selectedGroups.length > 0);

    if (needsDetailedFiltering) {
      // Start with a base query for the selected themes
      let query = ctx.db.query('questions');

      if (args.selectedThemes && args.selectedThemes.length > 0) {
        query = query.filter(q =>
          q.or(
            ...args.selectedThemes!.map(themeId =>
              q.eq(q.field('themeId'), themeId),
            ),
          ),
        );
      }

      // Add subtheme filter if needed
      if (args.selectedSubthemes && args.selectedSubthemes.length > 0) {
        query = query.filter(q =>
          q.or(
            ...args.selectedSubthemes!.map(subthemeId =>
              q.eq(q.field('subthemeId'), subthemeId),
            ),
          ),
        );
      }

      // Add group filter if needed
      if (args.selectedGroups && args.selectedGroups.length > 0) {
        query = query.filter(q =>
          q.or(
            ...args.selectedGroups!.map(groupId =>
              q.eq(q.field('groupId'), groupId),
            ),
          ),
        );
      }

      // Get the filtered questions
      const filteredQuestions = await query.collect();
      filteredCount = filteredQuestions.length;

      // Create a set of filtered question IDs for the mode-specific filtering
      const filteredQuestionIds = new Set(filteredQuestions.map(q => q._id));

      // Apply mode-specific filtering
      switch (args.questionMode) {
        case 'all': {
          // No additional filtering needed
          break;
        }

        case 'bookmarked': {
          // Get bookmarked questions and count only those in our filtered set
          const bookmarks = await ctx.db
            .query('userBookmarks')
            .withIndex('by_user', q => q.eq('userId', user._id))
            .collect();

          const validBookmarkCount = bookmarks.filter(b =>
            filteredQuestionIds.has(b.questionId),
          ).length;

          filteredCount = validBookmarkCount;
          break;
        }

        case 'incorrect': {
          // Get incorrect stats and count only those in our filtered set
          const incorrectStats = await ctx.db
            .query('userQuestionStats')
            .withIndex('by_user_incorrect', q =>
              q.eq('userId', user._id).eq('isIncorrect', true),
            )
            .collect();

          const validIncorrectCount = incorrectStats.filter(stat =>
            filteredQuestionIds.has(stat.questionId),
          ).length;

          filteredCount = validIncorrectCount;
          break;
        }

        case 'unanswered': {
          // Get answered stats and subtract from total
          const answeredStats = await ctx.db
            .query('userQuestionStats')
            .withIndex('by_user_answered', q =>
              q.eq('userId', user._id).eq('hasAnswered', true),
            )
            .collect();

          const answeredCount = answeredStats.filter(stat =>
            filteredQuestionIds.has(stat.questionId),
          ).length;

          filteredCount = filteredCount - answeredCount;
          break;
        }
      }
    } else {
      // If we don't need detailed filtering, we can apply mode-specific
      // filtering directly to the total count
      switch (args.questionMode) {
        case 'all': {
          // No adjustment needed
          break;
        }

        case 'bookmarked': {
          // Get all bookmarks (we can't easily filter by theme at the aggregate level)
          const bookmarks = await ctx.db
            .query('userBookmarks')
            .withIndex('by_user', q => q.eq('userId', user._id))
            .collect();

          // Count bookmarks that match the selected themes
          if (args.selectedThemes && args.selectedThemes.length > 0) {
            // For each bookmark, we need to check if it's in the selected themes
            const bookmarkQuestions = await Promise.all(
              bookmarks.map(b => ctx.db.get(b.questionId)),
            );

            const filteredBookmarks = bookmarkQuestions.filter(
              q => q && args.selectedThemes!.includes(q.themeId),
            );

            filteredCount = filteredBookmarks.length;
          } else {
            filteredCount = bookmarks.length;
          }
          break;
        }

        case 'incorrect': {
          // Get incorrect stats
          const incorrectStats = await ctx.db
            .query('userQuestionStats')
            .withIndex('by_user_incorrect', q =>
              q.eq('userId', user._id).eq('isIncorrect', true),
            )
            .collect();

          // Filter by selected themes if needed
          if (args.selectedThemes && args.selectedThemes.length > 0) {
            const incorrectQuestions = await Promise.all(
              incorrectStats.map(s => ctx.db.get(s.questionId)),
            );

            const filteredIncorrect = incorrectQuestions.filter(
              q => q && args.selectedThemes!.includes(q.themeId),
            );

            filteredCount = filteredIncorrect.length;
          } else {
            filteredCount = incorrectStats.length;
          }
          break;
        }

        case 'unanswered': {
          // Get answered stats
          const answeredStats = await ctx.db
            .query('userQuestionStats')
            .withIndex('by_user_answered', q =>
              q.eq('userId', user._id).eq('hasAnswered', true),
            )
            .collect();

          // Determine how many questions in the selected themes have been answered
          let answeredCount = 0;

          if (args.selectedThemes && args.selectedThemes.length > 0) {
            const answeredQuestions = await Promise.all(
              answeredStats.map(s => ctx.db.get(s.questionId)),
            );

            answeredCount = answeredQuestions.filter(
              q => q && args.selectedThemes!.includes(q.themeId),
            ).length;
          } else {
            answeredCount = answeredStats.length;
          }

          // Unanswered = total - answered
          filteredCount = totalCount - answeredCount;
          break;
        }
      }
    }

    return { count: filteredCount };
  },
});

export const deleteQuestion = mutation({
  args: { id: v.id('questions') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    // Use the helper function
    const success = await _internalDeleteQuestion(ctx, args.id);
    return success;
  },
});

// --- Backfill Action ---
// This action should be run manually ONCE after deployment
// to populate the aggregate with existing question data.
export const backfillThemeCounts = internalAction({
  handler: async ctx => {
    console.log('Starting backfill for question theme counts...');
    let count = 0;
    // Fetch all existing questions using api
    const questions = await ctx.runQuery(api.questions.listAll);

    // Iterate and insert each question into the aggregate using internal
    for (const questionDoc of questions) {
      try {
        await ctx.runMutation(internal.questions.insertIntoThemeAggregate, {
          questionDoc,
        });
        count++;
      } catch (error) {
        console.error(
          `Failed to insert question ${questionDoc._id} into theme aggregate:`,
          error,
        );
      }
    }

    console.log(
      `Successfully backfilled ${count} questions into theme aggregate.`,
    );
    return { count };
  },
});

// Helper internal mutation for the backfill action to call
// Using a mutation ensures atomicity for each aggregate insert
export const insertIntoThemeAggregate = internalMutation({
  args: { questionDoc: v.any() }, // Pass the whole doc
  handler: async (ctx, args) => {
    // We need to cast the doc because internal mutations don't
    // have full type inference across action/mutation boundary easily.
    const questionDoc = args.questionDoc as Doc<'questions'>;
    await questionCountByThemeAggregate.insert(ctx, questionDoc);
  },
});

export const searchByCode = query({
  args: {
    code: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!args.code || args.code.trim() === '') {
      return [];
    }

    // Normalize the search code
    const searchTerm = args.code.trim();

    // Use provided limit or default to 50
    const limit = args.limit || 50;

    // First search by code (since that's more specific)
    const codeResults = await ctx.db
      .query('questions')
      .withSearchIndex('search_by_code', q =>
        q.search('questionCode', searchTerm),
      )
      .take(limit); // Use the limit parameter

    // If we have enough code results, just return those
    if (codeResults.length >= limit) {
      const themes = await Promise.all(
        codeResults.map(question => ctx.db.get(question.themeId)),
      );
      return codeResults.map((question, index) => ({
        _id: question._id,
        title: question.title,
        questionCode: question.questionCode,
        themeId: question.themeId,
        theme: themes[index],
      }));
    }

    // If code search didn't return enough, search by title too
    const titleResults = await ctx.db
      .query('questions')
      .withSearchIndex('search_by_title', q => q.search('title', searchTerm))
      .take(limit - codeResults.length);

    // Combine results, eliminating duplicates (code results take priority)
    const seenIds = new Set(codeResults.map(q => q._id.toString()));
    const combinedResults = [
      ...codeResults,
      ...titleResults.filter(q => !seenIds.has(q._id.toString())),
    ];

    // If we have questions, fetch their themes
    if (combinedResults.length > 0) {
      const themes = await Promise.all(
        combinedResults.map(question => ctx.db.get(question.themeId)),
      );

      // Return minimal data to reduce bandwidth
      return combinedResults.map((question, index) => ({
        _id: question._id,
        title: question.title,
        questionCode: question.questionCode,
        themeId: question.themeId,
        theme: themes[index],
      }));
    }

    return [];
  },
});

// Add a standalone search by title function for specific title-only searches
export const searchByTitle = query({
  args: {
    title: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!args.title || args.title.trim() === '') {
      return [];
    }

    // Normalize the search term
    const searchTerm = args.title.trim();

    // Use provided limit or default to 50
    const limit = args.limit || 50;

    // Use the search index for efficient text search
    const matchingQuestions = await ctx.db
      .query('questions')
      .withSearchIndex('search_by_title', q => q.search('title', searchTerm))
      .take(limit);

    // If we have questions, fetch their themes
    if (matchingQuestions.length > 0) {
      const themes = await Promise.all(
        matchingQuestions.map(question => ctx.db.get(question.themeId)),
      );

      // Return minimal data to reduce bandwidth
      return matchingQuestions.map((question, index) => ({
        _id: question._id,
        title: question.title,
        questionCode: question.questionCode,
        themeId: question.themeId,
        theme: themes[index],
      }));
    }

    return [];
  },
});
