import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import * as Themes from './model/themes';
import * as Users from './model/users';

export const list = query({
  handler: async context => {
    await Users.getCurrentUser(context);
    return await Themes.listAllThemes(context);
  },
});

export const getWithSubthemes = query({
  args: { themeId: v.id('themes') },
  handler: async (context, arguments_) => {
    await Users.getCurrentUser(context);
    return await Themes.listThemeWithSubthemes(context, arguments_);
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (context, arguments_) => {
    await Users.getCurrentUser(context);
    return await Themes.createTheme(context, arguments_);
  },
});

export const createSubtheme = mutation({
  args: {
    themeId: v.id('themes'),
    name: v.string(),
  },
  handler: async (context, arguments_) => {
    await Users.getCurrentUser(context);
    return await Themes.createSubtheme(context, arguments_);
  },
});
