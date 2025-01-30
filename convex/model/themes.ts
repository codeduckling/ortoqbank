import { Id } from '../_generated/dataModel';
import {
  type MutationCtx as MutationContext,
  type QueryCtx as QueryContext,
} from '../_generated/server';

// Read operations
export async function listAllThemes(context: QueryContext) {
  return await context.db.query('themes').withIndex('by_order_name').collect();
}

export async function listThemeWithSubthemes(
  context: QueryContext,
  { themeId }: { themeId: Id<'themes'> },
) {
  const theme = await context.db.get(themeId);
  if (!theme) return;

  const subthemes = await context.db
    .query('subthemes')
    .withIndex('by_theme_order')
    .filter(q => q.eq(q.field('themeId'), themeId))
    .collect();

  return { theme, subthemes };
}

// Write operations
export async function createTheme(
  context: MutationContext,
  { name }: { name: string },
) {
  return await context.db.insert('themes', {
    name,
    order: 0,
    subthemeCount: 0,
  });
}

export async function createSubtheme(
  context: MutationContext,
  { name, themeId }: { name: string; themeId: Id<'themes'> },
) {
  const theme = await context.db.get(themeId);
  if (!theme) throw new Error('Theme not found');

  const subthemeId = await context.db.insert('subthemes', {
    name,
    themeId,
    order: theme.subthemeCount,
    themeName: theme.name,
  });

  await context.db.patch(themeId, {
    subthemeCount: theme.subthemeCount + 1,
  });

  return subthemeId;
}
