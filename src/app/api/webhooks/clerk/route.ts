import type { WebhookEvent } from '@clerk/backend';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';

// Import env variables to make sure they're available
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET_2;

// This is the main webhook handler for Clerk events
export async function POST(request: Request) {
  try {
    // Get the request body and headers
    const payload = await request.text();
    const headersList = request.headers;

    // Extract Svix headers
    const svix_id = headersList.get('svix-id');
    const svix_timestamp = headersList.get('svix-timestamp');
    const svix_signature = headersList.get('svix-signature');

    // Validate headers
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing required Svix headers' },
        { status: 400 },
      );
    }

    // Check for webhook secret
    if (!CLERK_WEBHOOK_SECRET) {
      console.error('Missing CLERK_WEBHOOK_SECRET_2 environment variable');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 },
      );
    }

    // Verify webhook signature
    const svixHeaders = {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    };

    let event;
    try {
      const webhook = new Webhook(CLERK_WEBHOOK_SECRET);
      event = webhook.verify(payload, svixHeaders) as WebhookEvent;
    } catch (error) {
      console.error('Webhook verification failed:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid webhook signature' },
        { status: 400 },
      );
    }

    // Process the event based on type
    if (event.type === 'session.created') {
      const { user_id, id: newSessionId } = event.data;

      try {
        // Get all user sessions from Clerk API
        const sessionsResponse = await fetch(
          `https://api.clerk.com/v1/users/${user_id}/sessions`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${CLERK_SECRET_KEY}`,
              'Content-Type': 'application/json',
            },
          },
        );

        if (!sessionsResponse.ok) {
          throw new Error(
            `Failed to get sessions: ${sessionsResponse.statusText}`,
          );
        }

        const sessions = await sessionsResponse.json();
        let revokedCount = 0;

        // Revoke all other sessions
        for (const session of sessions) {
          if (session.id !== newSessionId) {
            const revokeResponse = await fetch(
              `https://api.clerk.com/v1/sessions/${session.id}/revoke`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${CLERK_SECRET_KEY}`,
                  'Content-Type': 'application/json',
                },
              },
            );

            if (revokeResponse.ok) {
              revokedCount++;
            }
          }
        }

        console.log(
          `Enforced single session policy for user ${user_id}, revoked ${revokedCount} sessions`,
        );
      } catch (error) {
        console.error('Error processing session.created event:', error);
      }
    }

    // Always return success to acknowledge webhook receipt
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 },
    );
  }
}
