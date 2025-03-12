'use client';

import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { useAction } from 'convex/react';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { api } from '../../convex/_generated/api';
import { Button } from './ui/button';

interface PurchaseButtonProps {
  year?: string;
  priceId?: string;
  buttonText?: string;
}

export default function PurchaseButton({
  year = '2026',
  priceId,
  buttonText = 'Adquirir Acesso Anual',
}: PurchaseButtonProps) {
  const createCheckout = useAction(api.stripe.createCheckoutSession);
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      // Pass the year or priceId to the checkout session
      const { url } = await createCheckout({
        year: priceId ? undefined : year,
        priceId,
      });

      if (url) {
        globalThis.location.href = url;
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <SignedIn>
        <Button
          onClick={handlePurchase}
          disabled={isLoading}
          className="w-full bg-[#2196F3] hover:bg-[#1976D2]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            buttonText
          )}
        </Button>
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <Button className="w-full bg-[#2196F3] hover:bg-[#1976D2]">
            Criar conta
          </Button>
        </SignInButton>
      </SignedOut>
    </>
  );
}
