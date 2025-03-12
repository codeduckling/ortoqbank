import { ConvexHttpClient } from 'convex/browser';
import Stripe from 'stripe';

import stripe from '@/lib/stripe';

import { api } from '../../../../../convex/_generated/api';

// Direct HTTP fetch to Convex instead of using client
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

const convex = new ConvexHttpClient(CONVEX_URL);
export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error: any) {
    console.log(`Webhook signature verification failed.`, error.message);
    return new Response('Webhook signature verification failed.', {
      status: 400,
    });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      }

      default: {
        console.log(`Unhandled event type: ${event.type}`);
        break;
      }
    }
  } catch (error: any) {
    console.error(`Error processing webhook (${event.type}):`, error);
    return new Response('Error processing webhook', { status: 400 });
  }

  return new Response(undefined, { status: 200 });
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
) {
  const customer = session.customer as string;
  const userId = session.metadata?.userId;

  if (!userId || !customer) {
    throw new Error('Missing userId or customer in session metadata');
  }

  // Get product details from the line items
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
  if (lineItems.data.length === 0) {
    throw new Error('No line items in checkout session');
  }

  // Get the product ID from the first line item
  const item = lineItems.data[0];
  const priceId = item.price?.id;

  if (!priceId) {
    throw new Error('No price ID found in line item');
  }

  // Get the product ID from the price
  const price = await stripe.prices.retrieve(priceId, {
    expand: ['product'],
  });

  const productId =
    typeof price.product === 'string' ? price.product : price.product.id;

  console.log(`Recording purchase for user ${userId}, product ${productId}`);

  // Call Convex directly with fetch instead of using the client
  await convex.mutation(api.purchases.recordPurchase, {
    userId: userId,
    stripeProductId: productId,
    stripePurchaseId: session.id,
    stripePurchaseStatus: 'succeeded',
  });

  console.log('Purchase recorded successfully');
}
