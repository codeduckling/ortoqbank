import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import * as Themes from './model/themes';
import * as Users from './model/users';

export const createTheme = mutation({
  args: {
    name: v.string(),
    label: v.string(),
  },
  handler: async (context, arguments_) => {
    // await Users.getCurrentUser(context);
    return await Themes.createTheme(context, arguments_);
  },
});

export const createSubtheme = mutation({
  args: {
    name: v.string(),
    themeId: v.id('themes'),
  },
  handler: async (context, arguments_) => {
    return await Themes.createSubtheme(context, arguments_);
  },
});
