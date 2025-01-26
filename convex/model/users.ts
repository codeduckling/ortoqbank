import { QueryCtx } from '../_generated/server';

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Unauthorized');
  }

  const user = await ctx.db
    .query('users')
    .withIndex('by_clerkUserId', q => q.eq('clerkUserId', identity.subject))
    .unique();

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}
