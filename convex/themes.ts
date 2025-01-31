import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import * as Themes from './model/themes';
import * as Users from './model/users';

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('themes'),
      _creationTime: v.number(),
      name: v.string(),
      subthemeCount: v.number(),
    }),
  ),
  handler: async context => {
    await Users.getCurrentUser(context);
    return await Themes.listAllThemes(context);
  },
});

export const getWithSubthemes = query({
  args: { themeId: v.id('themes') },
  returns: v.union(
    v.null(),
    v.object({
      theme: v.object({
        _id: v.id('themes'),
        _creationTime: v.number(),
        name: v.string(),
        subthemeCount: v.number(),
      }),
      subthemes: v.array(
        v.object({
          _id: v.id('subthemes'),
          _creationTime: v.number(),
          name: v.string(),
          themeId: v.id('themes'),
          themeName: v.string(),
        }),
      ),
    }),
  ),
  handler: async (context, arguments_) => {
    await Users.getCurrentUser(context);
    return await Themes.listThemeWithSubthemes(context, arguments_);
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (context, arguments_) => {
    await Users.getCurrentUser(context);

    // Check if theme name already exists
    const existing = await context.db
      .query('themes')
      .withIndex('by_name', q => q.eq('name', arguments_.name))
      .unique();

    if (existing) {
      throw new Error('Já existe um tema com este nome');
    }

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

    // Check if subtheme name already exists in theme
    const theme = await context.db.get(arguments_.themeId);
    if (!theme) throw new Error('Tema não encontrado');

    const existingSubtheme = await context.db
      .query('subthemes')
      .withIndex('by_theme_name')
      .filter(q =>
        q.and(
          q.eq(q.field('themeId'), arguments_.themeId),
          q.eq(q.field('name'), arguments_.name),
        ),
      )
      .unique();

    if (existingSubtheme) {
      throw new Error('Já existe um subtema com este nome neste tema');
    }

    return await Themes.createSubtheme(context, arguments_);
  },
});

export const listAllSubthemes = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('subthemes'),
      _creationTime: v.number(),
      name: v.string(),
      themeId: v.id('themes'),
      themeName: v.string(),
    }),
  ),
  handler: async context => {
    await Users.getCurrentUser(context);
    return await Themes.listAllSubthemes(context);
  },
});
