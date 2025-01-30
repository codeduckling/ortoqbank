import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import * as Questions from './model/questions';
import * as Users from './model/users';

export const create = mutation({
  args: {
    text: v.string(),
    options: v.array(v.string()),
    correctOptionIndex: v.number(),
    explanation: v.string(),
    themeId: v.id('themes'),
    subthemeId: v.id('subthemes'),
    imageUrl: v.optional(v.string()),
  },
  handler: async (context, arguments_) => {
    await Users.getCurrentUser(context);

    if (arguments_.correctOptionIndex >= arguments_.options.length) {
      throw new Error('Invalid correct option index');
    }

    const theme = await context.db.get(arguments_.themeId);
    if (!theme) throw new Error('Theme not found');

    const subtheme = await context.db.get(arguments_.subthemeId);
    if (!subtheme) throw new Error('Subtheme not found');

    if (subtheme.themeId !== arguments_.themeId) {
      throw new Error('Subtheme does not belong to selected theme');
    }

    return await Questions.createQuestion(context, {
      ...arguments_,
      themeName: theme.name,
      subthemeName: subtheme.name,
    });
  },
});

export const getThemeCounts = query({
  handler: async context => {
    await Users.getCurrentUser(context);
    return await Questions.getAllThemeCounts(context);
  },
});
