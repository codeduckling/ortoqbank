import { v } from 'convex/values';

import { mutation } from './_generated/server';

export const generateUploadUrl = mutation(async context => {
  return await context.storage.generateUploadUrl();
});

export const saveImageUrl = mutation({
  args: {
    storageId: v.id('_storage'),
    field: v.union(
      v.literal('questionImageUrl'),
      v.literal('explanationImageUrl'),
    ),
    questionId: v.id('questions'),
  },
  handler: async (context, { storageId, field, questionId }) => {
    const url = await context.storage.getUrl(storageId);
    if (!url) throw new Error('Failed to get image URL');

    await context.db.patch(questionId, {
      [field]: url,
    });

    return url;
  },
});
