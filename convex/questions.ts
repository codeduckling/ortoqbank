import { v } from 'convex/values';

import { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';

export const create = mutation({
  args: {
    text: v.string(),
    title: v.string(),
    imageUrl: v.optional(v.string()),
    explanation: v.string(),
    options: v.array(
      v.object({
        text: v.string(),
        imageUrl: v.optional(v.string()),
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
      authorId: user._id,
      isPublic: false,
    });
  },
});
