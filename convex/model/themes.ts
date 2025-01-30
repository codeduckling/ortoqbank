import { Id } from '../_generated/dataModel';
import {
  type MutationCtx as MutationContext,
  type QueryCtx as QueryContext,
} from '../_generated/server';

export type ThemeInput = {
  name: string;
  label: string;
};

export type SubthemeInput = {
  name: string;
  themeId: Id<'themes'>;
};

export async function createTheme(
  context: MutationContext,
  themeData: ThemeInput,
) {
  return await context.db.insert('themes', themeData);
}

export async function createSubtheme(
  context: MutationContext,
  subthemeData: SubthemeInput,
) {
  return await context.db.insert('subthemes', subthemeData);
}
