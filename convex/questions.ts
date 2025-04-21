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

export const create = mutation({
  args: {
    questionText: v.object({ type: v.string(), content: v.array(v.any()) }),
    questionCode: v.optional(v.string()),
    title: v.string(),
    explanationText: v.object({ type: v.string(), content: v.array(v.any()) }),
    alternatives: v.array(v.string()),
    correctAlternativeIndex: v.number(),
    themeId: v.id('themes'),
    subthemeId: v.optional(v.id('subthemes')),
    groupId: v.optional(v.id('groups')),
  },
  handler: async (ctx, args) => {
    validateNoBlobs(args.questionText.content);
    validateNoBlobs(args.explanationText.content);

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

    return { ...question, theme, subtheme };
  },
});

export const update = mutation({
  args: {
    id: v.id('questions'),
    questionText: v.object({ type: v.string(), content: v.array(v.any()) }),
    questionCode: v.optional(v.string()),
    title: v.string(),
    explanationText: v.object({ type: v.string(), content: v.array(v.any()) }),
    alternatives: v.array(v.string()),
    correctAlternativeIndex: v.number(),
    themeId: v.id('themes'),
    subthemeId: v.optional(v.id('subthemes')),
    groupId: v.optional(v.id('groups')),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    // Don't need to check if question exists here, helper does it

    const { id, ...updateData } = args;

    // Prepare update data
    const updates = {
      ...updateData,
      normalizedTitle: args.title?.trim().toLowerCase(), // Handle optional title in updates
    };

    // Use the helper function
    await _internalUpdateQuestion(ctx, id, updates);

    return true; // Indicate success
  },
});

export const listAll = query({
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
      throw new Error('Not authenticated');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkUserId', q => q.eq('clerkUserId', identity.subject))
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

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

    if (args.selectedSubthemes && args.selectedSubthemes.length > 0) {
      query = query.filter(q =>
        q.or(
          ...args.selectedSubthemes!.map(subthemeId =>
            q.eq(q.field('subthemeId'), subthemeId),
          ),
        ),
      );
    }

    if (args.selectedGroups && args.selectedGroups.length > 0) {
      query = query.filter(q =>
        q.or(
          ...args.selectedGroups!.map(groupId =>
            q.eq(q.field('groupId'), groupId),
          ),
        ),
      );
    }

    const questions = await query.collect();
    const filteredQuestionIds = new Set(questions.map(q => q._id));
    let count = questions.length;

    switch (args.questionMode) {
      case 'all': {
        break;
      }

      case 'bookmarked': {
        const bookmarks = await ctx.db
          .query('userBookmarks')
          .withIndex('by_user', q => q.eq('userId', user._id))
          .collect();

        const validBookmarks = bookmarks.filter(b =>
          filteredQuestionIds.has(b.questionId),
        );

        count = validBookmarks.length;
        break;
      }

      case 'incorrect': {
        const incorrectStats = await ctx.db
          .query('userQuestionStats')
          .withIndex('by_user_incorrect', q =>
            q.eq('userId', user._id).eq('isIncorrect', true),
          )
          .collect();

        const validIncorrect = incorrectStats.filter(stat =>
          filteredQuestionIds.has(stat.questionId),
        );

        count = validIncorrect.length;
        break;
      }

      case 'unanswered': {
        const answeredStats = await ctx.db
          .query('userQuestionStats')
          .withIndex('by_user_answered', q =>
            q.eq('userId', user._id).eq('hasAnswered', true),
          )
          .collect();

        const answeredIds = new Set(
          answeredStats
            .filter(stat => filteredQuestionIds.has(stat.questionId))
            .map(stat => stat.questionId),
        );

        count = count - answeredIds.size;
        break;
      }
    }

    return { count };
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
