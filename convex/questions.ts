import { paginationOptsValidator } from 'convex/server';
import { v } from 'convex/values';

import { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';

export const create = mutation({
  args: {
    questionText: v.object({
      type: v.string(),
      content: v.array(v.any()),
    }),
    title: v.string(),
    explanationText: v.object({
      type: v.string(),
      content: v.array(v.any()),
    }),
    options: v.array(
      v.object({
        text: v.string(),
      }),
    ),
    correctOptionIndex: v.number(),
    themeId: v.id('themes'),
    subthemeId: v.optional(v.id('subthemes')),
    groupId: v.optional(v.id('groups')),
  },
  handler: async (context, arguments_) => {
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

    return await context.db.insert('questions', {
      ...arguments_,
      normalizedTitle: arguments_.title.trim().toLowerCase(),
      authorId: user._id,
      isPublic: false,
    });
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
  handler: async (context, args) => {
    const question = await context.db.get(args.id);
    if (!question) {
      throw new Error('Question not found');
    }

    // Fetch the associated theme
    const theme = await context.db.get(question.themeId);

    // Fetch the subtheme if it exists
    const subtheme = question.subthemeId
      ? await context.db.get(question.subthemeId)
      : null;

    return {
      ...question,
      theme,
      subtheme,
    };
  },
});
