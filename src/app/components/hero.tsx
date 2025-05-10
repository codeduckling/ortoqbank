'use client';

import { CircleCheckIcon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useMercadoPago from '@/hooks/useMercadoPago';

export default function HeroSection() {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const { createMercadoPagoCheckout } = useMercadoPago();

  const handlePurchase = () => {
    if (email && email.includes('@')) {
      createMercadoPagoCheckout({
        userEmail: email,
      });
      setShowEmailModal(false);
    }
  };

  return (
    <section className="w-full bg-white py-12 md:py-18">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center justify-center gap-4 lg:grid-cols-12">
            <div className="flex flex-col justify-center space-y-4 lg:col-span-4">
              <h1 className="text-center text-3xl font-bold text-blue-600 sm:text-4xl md:text-start md:text-4xl lg:text-5xl">
                A melhor preparação para o seu TEOT 2026
              </h1>
              <ul className="space-y-4 text-base text-gray-700 sm:text-lg md:text-start">
                {[
                  'Provas antigas corrigidas e comentadas',
                  'Questões inéditas reforçando os principais temas das provas',
                  'Comentários completos e ilustrados',
                  'Feedback detalhado de acordo com cada matéria',
                ].map(text => (
                  <li key={text} className="flex items-center gap-3">
                    <CircleCheckIcon className="h-6 w-6 flex-shrink-0 text-blue-600" />
                    <span className="flex-1">{text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  onClick={() => setShowEmailModal(true)}
                  className="cursor-pointer"
                >
                  Comprar Acesso
                </Button>
              </div>
            </div>
            <div className="flex justify-center lg:col-span-8">
              <div>
                <Image
                  src="/hero.png"
                  alt="OrtoQBank plataforma em múltiplos dispositivos mostrando questões e estatísticas"
                  width={800}
                  height={600}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Informe seu email para continuar</DialogTitle>
            <DialogDescription>
              Após a confirmação do pagamento, enviaremos um link de acesso para
              este email para que você possa completar seu cadastro e começar a
              usar a plataforma.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEmailModal(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handlePurchase}
              disabled={!email || !email.includes('@')}
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
