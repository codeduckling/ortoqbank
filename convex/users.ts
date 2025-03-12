import { UserJSON } from '@clerk/backend';
import { v, type Validator } from 'convex/values';

import {
  internalMutation,
  internalQuery,
  query,
  type QueryCtx as QueryContext,
} from './_generated/server';

export const current = query({
  args: {},
  handler: async context => {
    return await getCurrentUser(context);
  },
});

export const getUserByClerkId = internalQuery({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    return await userByClerkUserId(ctx, args.clerkUserId);
  },
});

export const getUserByStripeCustomerId = query({
  args: { stripeCustomerId: v.string() },
  handler: async (ctx, args) => {
    return await userByStripeCustomerId(ctx, args.stripeCustomerId);
  },
});

export const upsertFromClerk = internalMutation({
  args: {
    data: v.any() as Validator<UserJSON>,
    stripeCustomerId: v.string(),
  }, // no runtime validation, trust Clerk
  async handler(context, { data, stripeCustomerId }) {
    const userAttributes = {
      email: data.email_addresses[0].email_address,
      clerkUserId: data.id,
      firstName: data.first_name ?? undefined,
      lastName: data.last_name ?? undefined,
      imageUrl: data.image_url ?? undefined,
      stripeCustomerId: stripeCustomerId,
    };

    const user = await userByClerkUserId(context, data.id);
    await (user === null
      ? context.db.insert('users', userAttributes)
      : context.db.patch(user._id, userAttributes));
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(context, { clerkUserId }) {
    const user = await userByClerkUserId(context, clerkUserId);

    if (user === null) {
      console.warn(
        `Can't delete user, there is none for Clerk user ID: ${clerkUserId}`,
      );
    } else {
      await context.db.delete(user._id);
    }
  },
});

export async function getCurrentUserOrThrow(context: QueryContext) {
  const userRecord = await getCurrentUser(context);
  if (!userRecord) throw new Error("Can't get current user");
  return userRecord;
}

export async function getCurrentUser(context: QueryContext) {
  const identity = await context.auth.getUserIdentity();
  if (identity === null) {
    return;
  }
  return await userByClerkUserId(context, identity.subject);
}

async function userByClerkUserId(context: QueryContext, clerkUserId: string) {
  return await context.db
    .query('users')
    .withIndex('by_clerkUserId', q => q.eq('clerkUserId', clerkUserId))
    .unique();
}

async function userByStripeCustomerId(
  context: QueryContext,
  stripeCustomerId: string,
) {
  return await context.db
    .query('users')
    .withIndex('by_stripeCustomerId', q =>
      q.eq('stripeCustomerId', stripeCustomerId),
    )
    .unique();
}

export const hasCurrentYearAccess = query({
  args: {},
  handler: async ctx => {
    const user = await getCurrentUser(ctx);
    if (!user) return { hasAccess: false };

    // Get current year
    const currentYear = new Date().getFullYear().toString();

    // Check for purchases with the matching product year only
    const purchaseWithYear = await ctx.db
      .query('purchases')
      .withIndex('by_user', q => q.eq('userId', user._id))
      .filter(q =>
        q.and(
          q.eq(q.field('stripePurchaseStatus'), 'succeeded'),
          q.eq(q.field('productYear'), currentYear),
        ),
      )
      .first();

    // Access granted only if user has purchased the correct year pass
    return { hasAccess: purchaseWithYear !== null };
  },
});
