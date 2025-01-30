import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { createExam } from './model/exams';

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    themeId: v.id('themes'),
    subthemes: v.array(v.string()),
    questionIds: v.array(v.id('questions')),
    isPublished: v.boolean(),
  },
  handler: async (context, arguments_) => {
    return await createExam(context, arguments_);
  },
});
