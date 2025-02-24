import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { getCurrentUserOrThrow } from './users';

export const toggleBookmark = mutation({
  args: {
    questionId: v.id('questions'),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);

    const existingBookmark = await ctx.db
      .query('userBookmarks')
      .withIndex('by_user_question', q =>
        q.eq('userId', userId._id).eq('questionId', args.questionId),
      )
      .first();

    // If bookmark exists, delete it
    if (existingBookmark) {
      await ctx.db.delete(existingBookmark._id);
      return { success: true, bookmarked: false };
    }

    // Otherwise create a new bookmark
    await ctx.db.insert('userBookmarks', {
      userId: userId._id,
      questionId: args.questionId,
    });

    return { success: true, bookmarked: true };
  },
});

export const isBookmarked = query({
  args: {
    questionId: v.id('questions'),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);
    const { db } = ctx;

    const existing = db
      .query('userBookmarks')
      .withIndex('by_user_question', q =>
        q.eq('userId', userId._id).eq('questionId', args.questionId),
      )
      .first();

    return !!existing;
  },
});

// Check bookmark status for multiple questions in a single batch
export const getBookmarkStatusForQuestions = query({
  args: {
    questionIds: v.array(v.id('questions')),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);
    const { db } = ctx;

    // If no questions to check, return empty result
    if (args.questionIds.length === 0) {
      return {};
    }

    // Get all bookmarks for this user - we use the by_user index for efficiency
    const bookmarks = await db
      .query('userBookmarks')
      .withIndex('by_user', q => q.eq('userId', userId._id))
      .collect();

    // Create a map of questionId -> bookmarked status
    const bookmarkMap: Record<string, boolean> = {};

    // Initialize all requested questions as not bookmarked
    for (const questionId of args.questionIds) {
      bookmarkMap[questionId] = false;
    }

    // Mark the ones that are bookmarked
    for (const bookmark of bookmarks) {
      if (args.questionIds.includes(bookmark.questionId)) {
        bookmarkMap[bookmark.questionId] = true;
      }
    }

    return bookmarkMap;
  },
});

// Get all bookmarked question IDs for a user
export const getBookmarkedQuestionIds = query({
  args: {},
  handler: async ctx => {
    const userId = await getCurrentUserOrThrow(ctx);
    const { db } = ctx;

    // Get all bookmarks for this user
    const bookmarks = await db
      .query('userBookmarks')
      .withIndex('by_user', q => q.eq('userId', userId._id))
      .collect();

    // Return just the question IDs
    return bookmarks.map(bookmark => bookmark.questionId);
  },
});

// Get all bookmarked questions with full data
export const getBookmarkedQuestions = query({
  args: {},
  handler: async ctx => {
    const userId = await getCurrentUserOrThrow(ctx);
    const { db } = ctx;

    // Get all bookmarks for this user
    const bookmarks = await db
      .query('userBookmarks')
      .withIndex('by_user', q => q.eq('userId', userId._id))
      .collect();

    if (bookmarks.length === 0) {
      return [];
    }

    // Get all questions in a single batch
    const questionIds = bookmarks.map(bookmark => bookmark.questionId);

    // Use getAll to fetch all questions at once
    const questionsPromises = questionIds.map(id => db.get(id));
    const questions = await Promise.all(questionsPromises);

    // Filter out any null results (deleted questions)
    return questions.filter(q => q !== null);
  },
});

// Remove all bookmarks for a question (admin function)
export const removeAllBookmarksForQuestion = mutation({
  args: {
    questionId: v.id('questions'),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);
    // Optional: Add admin check here

    const bookmarks = await ctx.db
      .query('userBookmarks')
      .withIndex('by_question', q => q.eq('questionId', args.questionId))
      .collect();

    for (const bookmark of bookmarks) {
      await ctx.db.delete(bookmark._id);
    }

    return { success: true, count: bookmarks.length };
  },
});
