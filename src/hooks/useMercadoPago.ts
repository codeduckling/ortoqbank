import { initMercadoPago } from '@mercadopago/sdk-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
}

const useMercadoPago = () => {
  const router = useRouter();

  useEffect(() => {
    initMercadoPago(process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY!);
  }, []);

  async function createMercadoPagoCheckout(checkoutData: CheckoutData) {
    try {
      const response = await fetch('/api/mercado-pago/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      });

      const data = await response.json();

      router.push(data.initPoint);
    } catch (error) {
      console.log(error);
    }
  }

  return { createMercadoPagoCheckout };
};

export default useMercadoPago;
