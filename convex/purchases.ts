import { v } from 'convex/values';

import { Id } from './_generated/dataModel';
import { mutation } from './_generated/server';

/**
 * Record a purchase in the database.
 * This is used by the Stripe webhook handler when a checkout session is completed.
 */
export const recordPurchase = mutation({
  args: {
    userId: v.string(),
    stripeProductId: v.string(),
    stripePurchaseId: v.string(),
    stripePurchaseStatus: v.string(),
    productYear: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Create a purchase record
    return await ctx.db.insert('purchases', {
      userId: args.userId as Id<'users'>,
      stripeProductId: args.stripeProductId,
      stripePurchaseId: args.stripePurchaseId,
      stripePurchaseDate: Date.now(),
      stripePurchaseStatus: args.stripePurchaseStatus,
      productYear: args.productYear,
    });
  },
});
