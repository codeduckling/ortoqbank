import { ConvexError, v } from 'convex/values';

import stripe from '../src/lib/stripe';
import { internal } from './_generated/api';
import { action } from './_generated/server';

export const getAnnualPasses = action({
  args: {},
  handler: async (
    ctx,
  ): Promise<
    Record<
      string,
      {
        productId: string;
        priceId: string;
        name: string;
        description?: string;
        unitAmount?: number;
      }
    >
  > => {
    // This implementation runs in the backend, so it's secure
    // We're looking for active products with metadata.type = "annual_pass"
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
    });

    // Filter for products with annual_pass type in metadata
    const annualPasses = products.data
      .filter(product => product.metadata.type === 'annual_pass')
      .reduce(
        (acc, product) => {
          const price = product.default_price as any; // Type issue with Stripe API
          if (!price) return acc;

          const year = product.metadata.year;
          if (!year) return acc;

          acc[year] = {
            productId: product.id,
            priceId: price.id,
            name: product.name,
            description: product.description,
            unitAmount: price.unit_amount ? price.unit_amount / 100 : undefined,
          };
          return acc;
        },
        {} as Record<string, any>,
      );

    return annualPasses;
  },
});

export const createCheckoutSession = action({
  args: {
    year: v.optional(v.string()),
    priceId: v.optional(v.string()),
    successUrl: v.optional(v.string()),
    cancelUrl: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ url: string }> => {
    // Get the current user using the auth helper
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError(
        'You must be logged in to create a checkout session',
      );
    }

    // Get the user from the database
    const user = await ctx.runQuery(internal.users.getUserByClerkId, {
      clerkUserId: identity.subject,
    });

    if (!user) {
      throw new ConvexError('User not found');
    }

    // Determine which pass to use
    let priceId: string;
    if (args.priceId) {
      // Use explicitly provided price ID if given
      priceId = args.priceId;
    } else {
      // Otherwise, use the year parameter to select the appropriate pass
      const yearToUse = args.year;

      // Fetch from Stripe directly
      try {
        const products = await stripe.products.search({
          query: `metadata['year']:'${yearToUse}' AND metadata['type']:'annual_pass' AND active:'true'`,
        });

        if (products.data.length === 0) {
          throw new ConvexError(`No annual pass available for ${yearToUse}`);
        }

        const product = products.data[0];
        const priceObj = await stripe.prices.retrieve(
          product.default_price as string,
        );
        priceId = priceObj.id;
      } catch {
        throw new ConvexError(`No annual pass available for ${yearToUse}`);
      }
    }

    // Default URLs
    const successUrl =
      args.successUrl ||
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?success=true`;
    const cancelUrl =
      args.cancelUrl ||
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}?canceled=true`;

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      customer: user.stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: user._id.toString(),
      },
    });

    return { url: session.url || '' };
  },
});
