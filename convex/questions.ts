import { v } from 'convex/values';

import { Id } from './_generated/dataModel';
import { mutation } from './_generated/server';

export const create = mutation({
  args: {
    text: v.string(),
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

    // Validate theme exists
    const theme = await context.db.get(arguments_.themeId);
    if (!theme) {
      throw new Error('Theme not found');
    }

    // Validate subtheme if provided
    if (arguments_.subthemeId) {
      const subtheme = await context.db.get(arguments_.subthemeId);
      if (!subtheme) {
        throw new Error('Subtheme not found');
      }
      if (subtheme.themeId !== arguments_.themeId) {
        throw new Error('Subtheme does not belong to selected theme');
      }
    }

    // Validate group if provided
    if (arguments_.groupId) {
      if (!arguments_.subthemeId) {
        throw new Error('Cannot assign group without subtheme');
      }
      const group = await context.db.get(arguments_.groupId);
      if (!group) {
        throw new Error('Group not found');
      }
      if (group.subthemeId !== arguments_.subthemeId) {
        throw new Error('Group does not belong to selected subtheme');
      }
    }

    // Validate options
    if (arguments_.options.length < 2) {
      throw new Error('Question must have at least 2 options');
    }
    if (arguments_.correctOptionIndex >= arguments_.options.length) {
      throw new Error('Invalid correct option index');
    }

    return await context.db.insert('questions', {
      ...arguments_,
      authorId: user._id,
      isPublic: false, // New questions are private by default
    });
  },
});
