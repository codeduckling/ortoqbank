import { paginationOptsValidator } from 'convex/server';
import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import {
  _updateQuestionStatsOnDelete,
  _updateQuestionStatsOnInsert,
} from './questionStats';

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
  handler: async (context, arguments_) => {
    // Validate both text fields
    validateNoBlobs(arguments_.questionText.content);
    validateNoBlobs(arguments_.explanationText.content);

    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const user = await context.db
      .query('users')
      .withIndex('by_clerkUserId', q => q.eq('clerkUserId', identity.subject))
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    const id = await context.db.insert('questions', {
      ...arguments_,
      normalizedTitle: arguments_.title.trim().toLowerCase(),
      authorId: user._id,
      isPublic: false,
      alternatives: arguments_.alternatives,
    });

    // Get the inserted question and update the aggregate count
    const questionDoc = await context.db.get(id);
    if (questionDoc) {
      await _updateQuestionStatsOnInsert(context, questionDoc);
    }

    return id;
  },
});

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (context, arguments_) => {
    const questions = await context.db
      .query('questions')
      .order('desc')
      .paginate(arguments_.paginationOpts);

    // Fetch themes for all questions in the current page
    const themes = await Promise.all(
      questions.page.map(question => context.db.get(question.themeId)),
    );

    // Combine questions with theme data
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

    // Fetch the associated theme
    const theme = await context.db.get(question.themeId);

    // Fetch the subtheme if it exists
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
    title: v.string(),
    explanationText: v.object({ type: v.string(), content: v.array(v.any()) }),
    alternatives: v.array(v.string()),
    correctAlternativeIndex: v.number(),
    themeId: v.id('themes'),
    subthemeId: v.optional(v.id('subthemes')),
    groupId: v.optional(v.id('groups')),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (context, arguments_) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const question = await context.db.get(arguments_.id);
    if (!question) {
      throw new Error('Question not found');
    }

    const { id, ...updateData } = arguments_;
    return await context.db.patch(arguments_.id, {
      ...updateData,
      normalizedTitle: arguments_.title.trim().toLowerCase(),
      alternatives: arguments_.alternatives,
    });
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

    // Get total question count for 'all' mode
    const totalQuestions = await ctx.db.query('questions').collect();
    const totalCount = totalQuestions.length;

    // Initialize result with all questions count
    const result = {
      all: totalCount,
      unanswered: 0,
      incorrect: 0,
      bookmarked: 0,
    };

    // For 'incorrect' mode - count questions user has answered incorrectly
    const incorrectStats = await ctx.db
      .query('userQuestionStats')
      .withIndex('by_user_incorrect', q =>
        q.eq('userId', user._id).eq('isIncorrect', true),
      )
      .collect();
    result.incorrect = incorrectStats.length;

    // For 'bookmarked' mode - count bookmarked questions
    const bookmarks = await ctx.db
      .query('userBookmarks')
      .withIndex('by_user', q => q.eq('userId', user._id))
      .collect();
    result.bookmarked = bookmarks.length;

    // For 'unanswered' mode - calculate from all answered
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

export const countQuestionsByTheme = query({
  args: {
    questionMode: v.union(
      v.literal('all'),
      v.literal('unanswered'),
      v.literal('incorrect'),
      v.literal('bookmarked'),
    ),
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

    // Get all themes
    const themes = await ctx.db.query('themes').collect();

    // Initialize result structure
    const result = await Promise.all(
      themes.map(async theme => {
        // Get questions for this theme
        const themeQuestions = await ctx.db
          .query('questions')
          .filter(q => q.eq(q.field('themeId'), theme._id))
          .collect();

        const themeQuestionIds = new Set(themeQuestions.map(q => q._id));
        const totalCount = themeQuestions.length;

        // Default counts
        let count = totalCount;

        if (args.questionMode !== 'all') {
          // For 'bookmarked' mode
          switch (args.questionMode) {
            case 'bookmarked': {
              const themeBookmarks = await ctx.db
                .query('userBookmarks')
                .withIndex('by_user', q => q.eq('userId', user._id))
                .collect();

              // Filter bookmarks by this theme's questions
              const bookmarkedInTheme = themeBookmarks.filter(b =>
                themeQuestionIds.has(b.questionId),
              );
              count = bookmarkedInTheme.length;

              break;
            }
            case 'incorrect': {
              const incorrectStats = await ctx.db
                .query('userQuestionStats')
                .withIndex('by_user_incorrect', q =>
                  q.eq('userId', user._id).eq('isIncorrect', true),
                )
                .collect();

              // Filter by theme
              const incorrectInTheme = incorrectStats.filter(stat =>
                themeQuestionIds.has(stat.questionId),
              );
              count = incorrectInTheme.length;

              break;
            }
            case 'unanswered': {
              const answeredStats = await ctx.db
                .query('userQuestionStats')
                .withIndex('by_user_answered', q =>
                  q.eq('userId', user._id).eq('hasAnswered', true),
                )
                .collect();

              // Get IDs of answered questions in this theme
              const answeredQuestionIds = new Set(
                answeredStats
                  .filter(stat => themeQuestionIds.has(stat.questionId))
                  .map(stat => stat.questionId),
              );

              // Count unanswered as total - answered
              count = totalCount - answeredQuestionIds.size;

              break;
            }
            // No default
          }
        }

        return {
          theme: {
            _id: theme._id,
            name: theme.name,
          },
          count,
        };
      }),
    );

    return result;
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

    // Step 1: Get base question set based on filters
    let query = ctx.db.query('questions');

    // Apply theme filter if provided
    if (args.selectedThemes && args.selectedThemes.length > 0) {
      // Use "in" operator instead of includes for proper filtering
      query = query.filter(q =>
        q.or(
          ...args.selectedThemes!.map(themeId =>
            q.eq(q.field('themeId'), themeId),
          ),
        ),
      );
    }

    // Apply subtheme filter if provided
    if (args.selectedSubthemes && args.selectedSubthemes.length > 0) {
      // Use "in" operator instead of includes for proper filtering
      query = query.filter(q =>
        q.or(
          ...args.selectedSubthemes!.map(subthemeId =>
            q.eq(q.field('subthemeId'), subthemeId),
          ),
        ),
      );
    }

    // Apply group filter if provided
    if (args.selectedGroups && args.selectedGroups.length > 0) {
      // Use "in" operator instead of includes for proper filtering
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

    // Step 2: Apply question mode filter
    switch (args.questionMode) {
      case 'all': {
        // Already filtered above
        break;
      }

      case 'bookmarked': {
        // Get bookmarked questions
        const bookmarks = await ctx.db
          .query('userBookmarks')
          .withIndex('by_user', q => q.eq('userId', user._id))
          .collect();

        // Filter bookmarks to those in our filtered set
        const validBookmarks = bookmarks.filter(b =>
          filteredQuestionIds.has(b.questionId),
        );

        count = validBookmarks.length;
        break;
      }

      case 'incorrect': {
        // Get incorrectly answered questions
        const incorrectStats = await ctx.db
          .query('userQuestionStats')
          .withIndex('by_user_incorrect', q =>
            q.eq('userId', user._id).eq('isIncorrect', true),
          )
          .collect();

        // Filter to those in our filtered set
        const validIncorrect = incorrectStats.filter(stat =>
          filteredQuestionIds.has(stat.questionId),
        );

        count = validIncorrect.length;
        break;
      }

      case 'unanswered': {
        // Get all answered questions
        const answeredStats = await ctx.db
          .query('userQuestionStats')
          .withIndex('by_user_answered', q =>
            q.eq('userId', user._id).eq('hasAnswered', true),
          )
          .collect();

        // Get IDs of answered questions in our filtered set
        const answeredIds = new Set(
          answeredStats
            .filter(stat => filteredQuestionIds.has(stat.questionId))
            .map(stat => stat.questionId),
        );

        // Unanswered count is total filtered - answered
        count = count - answeredIds.size;
        break;
      }
    }

    return { count };
  },
});

export const deleteQuestion = mutation({
  args: { id: v.id('questions') },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const question = await context.db.get(args.id);
    if (!question) {
      throw new Error('Question not found');
    }

    // Get the question before deleting it
    const questionDoc = await context.db.get(args.id);

    // Delete the question
    await context.db.delete(args.id);

    // Update the aggregate count
    if (questionDoc) {
      await _updateQuestionStatsOnDelete(context, questionDoc);
    }

    return true;
  },
});
