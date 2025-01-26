import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import * as Questions from './model/questions';
import * as Users from './model/users';

export const createQuestion = mutation({
  args: {
    text: v.string(),
    options: v.array(
      v.object({
        text: v.string(),
        imageUrl: v.optional(v.string()),
      }),
    ),
    correctOptionIndex: v.number(),
    explanation: v.string(),
    theme: v.string(),
    subjects: v.array(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (context, arguments_) => {
    await Users.getCurrentUser(context);

    // Validate the correctOptionIndex
    if (arguments_.correctOptionIndex >= arguments_.options.length) {
      throw new Error('Invalid correct option index');
    }

    return Questions.createQuestion(context, arguments_);
  },
});

export const getAllThemeCounts = query({
  handler: async context => {
    return Questions.getAllThemeCounts(context);
  },
});
