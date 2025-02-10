import { Check } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function Pricing() {
  return (
    <section id="precos" className="bg-gray-100 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-center text-3xl font-bold text-[#2196F3] md:text-4xl">
          Plano de Assinatura
        </h2>
        <div className="flex justify-center">
          <div className="w-full max-w-md rounded-lg border border-[#2196F3] bg-white p-8 shadow-lg">
            <h3 className="mb-4 text-center text-2xl font-bold text-[#2196F3]">
              Acesso Premium
            </h3>
            <p className="mb-6 text-center text-4xl font-bold text-[#2196F3]">
              R$ 89,90<span className="text-base text-gray-600">/mês</span>
            </p>
            <ul className="mb-8 space-y-4">
              {[
                'Acesso a mais de 1.000 questões especializadas',
                'Simulados personalizados por área',
                'Estatísticas detalhadas de desempenho',
                'Comentários explicativos de especialistas',
                'Atualizações mensais do banco de questões',
                'Acesso via desktop e dispositivos móveis',
              ].map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button className="hover:bg-opacity-90 w-full bg-[#2196F3] text-lg font-semibold text-white">
              Começar Agora
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
