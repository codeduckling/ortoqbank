import { Preference } from 'mercadopago';
import { NextRequest, NextResponse } from 'next/server';

import mpClient from '@/lib/mercado-pago';

export async function POST(req: NextRequest) {
  const {
    testeId,
    userEmail,
    userName,
    userLastName,
    userAddress,
    userIdentification,
    userPhone,
  } = await req.json();

  try {
    // Define the regular and PIX prices directly
    const REGULAR_PRICE = 1999.9;
    const PIX_PRICE = 1899.9;
    const DISCOUNT_AMOUNT = REGULAR_PRICE - PIX_PRICE;

    const preference = new Preference(mpClient);
    const origin = req.headers.get('origin') || 'https://ortoqbank.com.br';

    const createdPreference = await preference.create({
      body: {
        external_reference: testeId,
        metadata: {
          testeId,
          userEmail,
        },
        ...(userEmail && {
          payer: {
            name: userName || 'Cliente',
            surname: userLastName || 'Ortoqbank',
            email: userEmail,
            ...(userIdentification && {
              identification: {
                type: userIdentification.type,
                number: userIdentification.number,
              },
            }),
            ...(userPhone && {
              phone: {
                area_code: userPhone.area_code,
                number: userPhone.number,
              },
            }),
            ...(userAddress && {
              address: {
                zip_code: userAddress.zipcode,
                street_name: userAddress.street,
                street_number: userAddress.number,
              },
            }),
          },
        }),

        // Original items implementation
        items: [
          {
            id: '4042011329',
            description: 'Acesso ao ortoqbank 2025',
            title: 'Ortoqbank 2025',
            quantity: 1,
            unit_price: REGULAR_PRICE,
            currency_id: 'BRL',
            category_id: 'education',
          },
        ],

        // Payment method configuration with PIX discount
        payment_methods: {
          // Set PIX as the default payment method

          // Configure discounts for payment methods
          discounts: [
            {
              payment_method_id: 'pix',
              type: 'fixed',
              value: DISCOUNT_AMOUNT,
            },
          ],

          installments: 12,
        } as Record<string, any>,

        // Add webhook notification URL
        notification_url: `${origin}/api/mercado-pago/webhook`,

        // Only use auto_return in production
        ...(process.env.NODE_ENV === 'production' && {
          auto_return: 'approved',
        }),

        back_urls: {
          success: `${origin}/?status=sucesso`,
          failure: `${origin}/?status=falha`,
          pending: `${origin}/api/mercado-pago/pending`,
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
      regularPrice: REGULAR_PRICE,
      pixPrice: PIX_PRICE,
    });
  } catch (error) {
    console.error('Error creating Mercado Pago preference:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout preference' },
      { status: 500 },
    );
  }
}
