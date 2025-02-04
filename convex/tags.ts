import { v } from 'convex/values';

import { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';

// Queries
export const list = query({
  args: {},
  handler: async context => {
    return await context.db.query('tags').collect();
  },
});

export const getById = query({
  args: { id: v.id('tags') },
  handler: async (context, { id }) => {
    return await context.db.get(id);
  },
});

// Mutations
export const create = mutation({
  args: { name: v.string() },
  handler: async (context, { name }) => {
    return await context.db.insert('tags', { name });
  },
});

export const update = mutation({
  args: {
    id: v.id('tags'),
    name: v.string(),
  },
  handler: async (context, { id, name }) => {
    // Check if tag exists
    const existing = await context.db.get(id);
    if (!existing) {
      throw new Error('Tag not found');
    }

    return await context.db.patch(id, { name });
  },
});

export const remove = mutation({
  args: { id: v.id('tags') },
  handler: async (context, { id }) => {
    // Check if tag exists
    const existing = await context.db.get(id);
    if (!existing) {
      throw new Error('Tag not found');
    }

    // Note: You might want to add additional checks here if you need to prevent
    // deletion of tags that are in use by questions

    await context.db.delete(id);
  },
});
