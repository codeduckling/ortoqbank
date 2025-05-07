'use client';

import { Check } from 'lucide-react';
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

export default function Pricing() {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const { createMercadoPagoCheckout } = useMercadoPago();

  const handlePurchase = () => {
    if (email && email.includes('@')) {
      createMercadoPagoCheckout({
        testeId: '123',
        userEmail: email,
      });
      setShowEmailModal(false);
    }
  };

  return (
    <section id="precos" className="bg-gray-100 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-2 text-center text-3xl font-bold text-[#2196F3] md:text-4xl">
          OrtoQBank 2026
        </h2>
        <p className="mb-8 text-center text-lg text-gray-700">
          Garanta o seu acesso até o TEOT 2026
        </p>
        <div className="flex justify-center">
          <div className="w-full max-w-md rounded-lg border border-[#2196F3] bg-white p-8 shadow-lg">
            <ul className="mb-8 space-y-4">
              {[
                'Trilhas de estudo com questões inéditas',
                'Simulados e provas antigas',
                'Testes personalizados',
                'Estude apenas fazendo questões e alcance um desempenho diferenciado!',
              ].map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mb-8 text-center">
              <p className="mb-1 text-gray-600">De: R$ 1.999,90</p>
              <p className="mb-4 text-2xl font-bold text-[#2196F3]">
                por R$1.899,90 no PIX
              </p>
              <p className="text-lg font-medium text-gray-700">
                parcelado em até 6x
              </p>
            </div>

            <Button
              className="hover:bg-opacity-90 w-full bg-[#2196F3] text-lg font-semibold text-white"
              onClick={() => setShowEmailModal(true)}
            >
              GARANTIR MINHA VAGA AGORA!
            </Button>
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
