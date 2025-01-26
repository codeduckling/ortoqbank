import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
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
    subject: v.string(),
    tags: v.array(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await Users.getCurrentUser(ctx);

    // Validate the correctOptionIndex
    if (args.correctOptionIndex >= args.options.length) {
      throw new Error('Invalid correct option index');
    }

    return Questions.createQuestion(ctx, args);
  },
});
