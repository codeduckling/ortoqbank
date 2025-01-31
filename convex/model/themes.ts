import { Id } from '../_generated/dataModel';
import {
  type MutationCtx as MutationContext,
  type QueryCtx as QueryContext,
} from '../_generated/server';

// Read operations
export async function listAllThemes(context: QueryContext) {
  // Use withIndex for better performance and caching
  return await context.db.query('themes').withIndex('by_name').collect();
}

export async function listAllSubthemes(context: QueryContext) {
  // Use withIndex for better performance and caching
  return await context.db
    .query('subthemes')
    .withIndex('by_theme_name')
    .collect();
}

export async function listThemeWithSubthemes(
  context: QueryContext,
  { themeId }: { themeId: Id<'themes'> },
) {
  const theme = await context.db.get(themeId);
  if (!theme) throw new Error('Tema não encontrado');

  const subthemes = await context.db
    .query('subthemes')
    .withIndex('by_theme_name', q => q.eq('themeId', themeId))
    .collect();

  return { theme, subthemes };
}

// Helper function: Check if a theme name exists
export async function themeExists(context: QueryContext, name: string) {
  const existing = await context.db
    .query('themes')
    .withIndex('by_name', q => q.eq('name', name))
    .unique();

  return existing !== null;
}

// Write operations
export async function createTheme(
  context: MutationContext,
  { name }: { name: string },
) {
  return context.db.insert('themes', {
    name,
    subthemeCount: 0,
  });
}

// Helper function: Check if a subtheme exists in a theme
export async function subthemeExists(
  context: QueryContext,
  themeId: Id<'themes'>,
  name: string,
) {
  const existingSubtheme = await context.db
    .query('subthemes')
    .withIndex('by_theme_name')
    .filter(q =>
      q.and(q.eq(q.field('themeId'), themeId), q.eq(q.field('name'), name)),
    )
    .unique();

  return existingSubtheme !== null;
}

export async function createSubtheme(
  context: MutationContext,
  { name, themeId }: { name: string; themeId: Id<'themes'> },
) {
  const theme = await context.db.get(themeId);
  if (!theme) throw new Error('Tema não encontrado');

  return await context.db.insert('subthemes', {
    name,
    themeId,
    themeName: theme.name,
  });
}
