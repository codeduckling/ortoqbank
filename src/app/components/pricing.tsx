import { Check } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function Pricing() {
  return (
    <section id="precos" className="bg-gray-100 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-center text-3xl font-bold text-[#2196F3] md:text-4xl">
          <span className="text-base text-gray-600">Plano de Tratamento</span>
        </h2>
        <div className="flex justify-center">
          <div className="w-full max-w-md rounded-lg border border-[#2196F3] bg-white p-8 shadow-lg">
            <h3 className="mb-4 text-center text-2xl font-bold text-[#2196F3]">
              Consulta Especializada
            </h3>
            <p className="mb-6 text-center text-4xl font-bold text-[#2196F3]">
              R$ 350,00
            </p>
            <ul className="mb-8 space-y-4">
              {[
                'Avaliação completa com especialista',
                'Exame físico detalhado',
                'Análise de exames anteriores',
                'Plano de tratamento personalizado',
                'Retorno em 30 dias incluso',
              ].map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full bg-[#2196F3] text-lg font-semibold text-white hover:bg-opacity-90">
              Agendar Consulta
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
