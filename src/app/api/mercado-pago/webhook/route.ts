// app/api/mercadopago-webhook/route.js

import { Payment } from 'mercadopago';
import { NextResponse } from 'next/server';

import { handleMercadoPagoPayment } from '@/lib/handle-payments';
import mpClient, { verifyMercadoPagoSignature } from '@/lib/mercado-pago';

export async function POST(request: Request) {
  try {
    verifyMercadoPagoSignature(request);

    const body = await request.json();

    const { type, data } = body;

    switch (type) {
      case 'payment': {
        const payment = new Payment(mpClient);
        const paymentData = await payment.get({ id: data.id });
        if (
          paymentData.status === 'approved' || // Pagamento por cartão OU
          paymentData.date_approved !== null // Pagamento por Pix
        ) {
          await handleMercadoPagoPayment(paymentData);
        }
        break;
      }
      // case "subscription_preapproval": Eventos de assinatura
      //   console.log("Subscription preapproval event");
      //   console.log(data);
      //   break;
      default: {
        console.log('Unhandled event type:', type);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 },
    );
  }
}
