import 'server-only';

import { clerkClient } from '@clerk/nextjs/server';
import { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';

/**
 * Checks if the payment status represents a completed transaction
 */
function isCompletedPayment(status: string | undefined): boolean {
  if (!status) return false;

  // Mercado Pago payment statuses that indicate successful payment
  const successStatuses = ['approved', 'authorized'];
  return successStatuses.includes(status);
}

export async function handleMercadoPagoPayment(paymentData: PaymentResponse) {
  const metadata = paymentData.metadata;
  const userEmail = metadata.user_email; // Os metadados do Mercado Pago são convertidos para snake_case
  const testeId = metadata.teste_id; // Os metadados do Mercado Pago são convertidos para snake_case

  if (!userEmail) {
    console.error('Missing user email in payment metadata');
    return;
  }

  // Verify that payment is completed before proceeding
  if (!isCompletedPayment(paymentData.status)) {
    console.log(
      `Payment ${paymentData.id} has status ${paymentData.status || 'undefined'}, not updating user`,
    );
    return;
  }

  try {
    // Initialize Clerk client
    const clerk = await clerkClient();

    // Check if the user already exists
    const existingUsers = await clerk.users.getUserList({
      emailAddress: [userEmail as string],
    });

    if (existingUsers.data.length > 0) {
      // User already exists, update their metadata to mark as paid
      const userId = existingUsers.data[0].id;
      await clerk.users.updateUser(userId, {
        publicMetadata: {
          paid: true,
          paymentId: paymentData.id,
          testeId: testeId,
          paymentDate: new Date().toISOString(),
          paymentStatus: paymentData.status,
        },
      });
      console.log(`Updated existing user ${userId} with payment info`);
      return;
    }

    // Send invitation to the user
    const invitation = await clerk.invitations.createInvitation({
      emailAddress: userEmail as string,
      redirectUrl:
        process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ||
        'https://ortoqbank.com/sign-in',
      publicMetadata: {
        paid: true,
        paymentId: paymentData.id,
        testeId: testeId,
        paymentDate: new Date().toISOString(),
        paymentStatus: paymentData.status,
      },
    });

    console.log(`Invitation sent to ${userEmail}, ID: ${invitation.id}`);
  } catch (error) {
    console.error('Error sending Clerk invitation:', error);
  }

  return;
}
