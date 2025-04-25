import { Preference } from 'mercadopago';
import { NextRequest, NextResponse } from 'next/server';

import mpClient from '@/lib/mercado-pago';

export async function POST(req: NextRequest) {
  const { testeId, userEmail } = await req.json();

  try {
    // Define the regular and PIX prices directly
    const regularPrice = 1999.9;
    const pixPrice = 1899;
    const discountAmount = regularPrice - pixPrice;

    const preference = new Preference(mpClient);

    const createdPreference = await preference.create({
      body: {
        external_reference: testeId,
        metadata: {
          testeId,
          userEmail,
        },
        ...(userEmail && {
          payer: {
            email: userEmail,
          },
        }),

        // Original items implementation
        items: [
          {
            id: '4042011329',
            description: 'Acesso ao ortoqbank 2025',
            title: 'Ortoqbank 2025',
            quantity: 1,
            unit_price: regularPrice,
            currency_id: 'BRL',
            category_id: 'education',
          },
        ],

        // Payment method configuration with PIX discount
        payment_methods: {
          // Set PIX as the default payment method
          default_payment_method_id: 'pix',

          // Configure discounts for payment methods
          discounts: [
            {
              payment_method_id: 'pix',
              type: 'fixed',
              value: discountAmount,
            },
          ],

          installments: 12,
        },

        auto_return: 'approved',
        back_urls: {
          success: `${req.headers.get('origin')}/?status=sucesso`,
          failure: `${req.headers.get('origin')}/?status=falha`,
          pending: `${req.headers.get('origin')}/api/mercado-pago/pending`,
        },

        statement_descriptor: 'ORTOQBANK',
      },
    });

    if (!createdPreference.id) {
      throw new Error('Failed to create preference');
    }

    return NextResponse.json({
      preferenceId: createdPreference.id,
      initPoint: createdPreference.init_point,
      regularPrice: regularPrice,
      pixPrice: pixPrice,
    });
  } catch (error) {
    console.error('Error creating Mercado Pago preference:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout preference' },
      { status: 500 },
    );
  }
}
