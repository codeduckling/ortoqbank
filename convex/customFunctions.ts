import {
  customCtx,
  customMutation,
  customQuery,
} from 'convex-helpers/server/customFunctions';

import {
  internalMutation as rawInternalMutation,
  mutation as rawMutation,
} from './_generated/server';
import { triggers } from './triggers';

// Create custom functions with the triggers wrapped DB
export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
// Export regular query without any custom context

export const internalMutation = customMutation(
  rawInternalMutation,
  customCtx(triggers.wrapDB),
);

export { query } from './_generated/server';
