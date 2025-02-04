import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // Users table
  users: defineTable({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    clerkUserId: v.string(),
  }).index('by_clerkUserId', ['clerkUserId']),

  themes: defineTable({
    name: v.string(),
  })
    .index('by_name', ['name'])
    .searchIndex('search_text', {
      searchField: 'name',
    }),

  subthemes: defineTable({
    name: v.string(),
    themeId: v.id('themes'),
  }).index('by_theme', ['themeId']),

  groups: defineTable({
    name: v.string(),
    subthemeId: v.id('subthemes'),
  }).index('by_subtheme', ['subthemeId']),

  // Tags table
  tags: defineTable({
    name: v.string(),
  }),
});
