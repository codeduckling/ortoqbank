'use client';

import useMercadoPago from '@/hooks/useMercadoPago';

export default function Home() {
  const { createMercadoPagoCheckout } = useMercadoPago();
  return (
    <div className="flex h-screen items-center justify-center">
      <button
        onClick={() =>
          createMercadoPagoCheckout({
            testeId: '123',
            userEmail: 'test@gmail.com',
          })
        }
        className="rounded-md bg-blue-500 px-4 py-2 text-white"
      >
        Comprar
      </button>
    </div>
  );
}
