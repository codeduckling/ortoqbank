import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

// Queries
export const list = query({
  args: {},
  handler: async context => {
    return await context.db.query('themes').collect();
  },
});

export const getById = query({
  args: { id: v.id('themes') },
  handler: async (context, { id }) => {
    return await context.db.get(id);
  },
});

// Mutations
export const create = mutation({
  args: { name: v.string() },
  handler: async (context, { name }) => {
    // Check if theme with same name already exists
    const existing = await context.db
      .query('themes')
      .withIndex('by_name', q => q.eq('name', name))
      .unique();

    if (existing) {
      throw new Error(`Theme "${name}" already exists`);
    }

    return await context.db.insert('themes', { name });
  },
});

export const update = mutation({
  args: {
    id: v.id('themes'),
    name: v.string(),
  },
  handler: async (context, { id, name }) => {
    // Check if theme exists
    const existing = await context.db.get(id);
    if (!existing) {
      throw new Error('Theme not found');
    }

    // Check if new name conflicts with another theme
    const nameConflict = await context.db
      .query('themes')
      .withIndex('by_name', q => q.eq('name', name))
      .unique();

    if (nameConflict && nameConflict._id !== id) {
      throw new Error(`Theme "${name}" already exists`);
    }

    return await context.db.patch(id, { name });
  },
});

export const remove = mutation({
  args: { id: v.id('themes') },
  handler: async (context, { id }) => {
    // Check if theme exists
    const existing = await context.db.get(id);
    if (!existing) {
      throw new Error('Theme not found');
    }

    // Check if there are any subthemes using this theme
    const subthemes = await context.db
      .query('subthemes')
      .withIndex('by_theme', q => q.eq('themeId', id))
      .collect();

    if (subthemes.length > 0) {
      throw new Error('Cannot delete theme that has subthemes');
    }

    await context.db.delete(id);
  },
});
