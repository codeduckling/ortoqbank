import { initMercadoPago } from '@mercadopago/sdk-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useToast } from '@/hooks/use-toast';

interface Address {
  street: string;
  number: string;
  zipcode: string;
  city: string;
  state: string;
}

interface Identification {
  type: string;
  number: string;
}

interface Phone {
  area_code: string;
  number: string;
}

interface CheckoutData {
  userEmail: string;
  userName?: string;
  userLastName?: string;
  testeId?: string;
  userAddress?: Address;
  userIdentification?: Identification;
  userPhone?: Phone;
  couponCode?: string;
}

const useMercadoPago = () => {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    initMercadoPago(process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY!);
  }, []);

  async function validateCoupon(couponCode: string) {
    try {
      const response = await fetch(
        `/api/mercado-pago/create-checkout?coupon=${couponCode}`,
      );
      const data = await response.json();

      if (data.valid) {
        toast({
          title: 'Cupom válido!',
          description: `${data.coupon.description} aplicado com sucesso.`,
          variant: 'default',
        });
        return data;
      } else {
        toast({
          title: 'Cupom inválido',
          description: data.message || 'Este cupom não existe ou expirou.',
          variant: 'destructive',
        });
        return;
      }
    } catch {
      toast({
        title: 'Erro ao validar cupom',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
      return;
    }
  }

  async function createMercadoPagoCheckout(checkoutData: CheckoutData) {
    try {
      if (checkoutData.couponCode) {
        const couponValidation = await validateCoupon(checkoutData.couponCode);
        if (!couponValidation) {
          return;
        }
      }

      const response = await fetch('/api/mercado-pago/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (checkoutData.couponCode && data.couponApplied) {
        toast({
          title: 'Checkout criado com sucesso!',
          description: `Cupom ${data.couponApplied} aplicado: ${data.couponDescription}`,
          variant: 'default',
        });
      }

      router.push(data.initPoint);
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: 'Erro ao criar checkout',
        description:
          error instanceof Error
            ? error.message
            : 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    }
  }

  return {
    createMercadoPagoCheckout,
    validateCoupon,
  };
};

export default useMercadoPago;
