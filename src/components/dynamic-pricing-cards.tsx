'use client';

import { useAction } from 'convex/react';
import { Check, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { api } from '../../convex/_generated/api';
import PurchaseButton from './purchase-button';

export default function DynamicPricingCards() {
  const getAnnualPasses = useAction(api.stripe.getAnnualPasses);
  const [annualPasses, setAnnualPasses] = useState<
    Record<string, any> | undefined
  >();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [currentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    async function fetchPasses() {
      try {
        const passes = await getAnnualPasses({});
        setAnnualPasses(passes);
      } catch (error_) {
        console.error('Error fetching annual passes:', error_);
        setError('Failed to load pricing options. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPasses();
  }, [getAnnualPasses]);

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center p-4">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#2196F3]" />
        <p className="text-sm text-gray-600">Carregando opções de acesso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (!annualPasses || Object.keys(annualPasses).length === 0) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
        <p className="text-amber-800">
          Nenhum pacote de acesso disponível no momento. Entre em contato
          conosco para mais informações.
        </p>
      </div>
    );
  }

  // Sort years in descending order (newest first)
  const years = Object.keys(annualPasses).sort(
    (a, b) => Number.parseInt(b) - Number.parseInt(a),
  );

  return (
    <div className="mb-10 grid gap-6 md:grid-cols-2">
      {years.map((year, index) => {
        const pass = annualPasses[year];
        const isCurrentYear = Number.parseInt(year) === currentYear;
        const isRecommended = index === 0; // First item (newest year) is recommended

        return (
          <div
            key={year}
            className={`overflow-hidden rounded-xl border ${
              isRecommended
                ? 'border-[#2196F3] bg-white p-6 shadow-lg'
                : 'border-gray-200 bg-white p-6 shadow-md'
            }`}
          >
            {isRecommended && (
              <div className="mb-4 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                Recomendado
              </div>
            )}

            <h3
              className={`mb-4 text-center text-xl font-bold ${
                isRecommended ? 'text-[#2196F3]' : 'text-gray-700'
              }`}
            >
              {pass.name || `Passe Anual ${year}`}
            </h3>

            <p className="mb-4 text-sm text-gray-600">
              {pass.description ||
                `Acesso ao conteúdo até 31 de dezembro de ${year}`}
            </p>

            {pass.unitAmount && (
              <p className="mb-4 text-center">
                <span className="text-2xl font-bold text-gray-900">
                  R${pass.unitAmount.toFixed(2).replace('.', ',')}
                </span>
                <span className="ml-2 text-sm text-gray-600">
                  pagamento único
                </span>
              </p>
            )}

            <ul className="mb-6 space-y-3">
              {[
                'Acesso a todas as trilhas de estudo',
                'Simulados e provas antigas',
                'Testes personalizados ilimitados',
                ...(isCurrentYear
                  ? ['Atualizações de conteúdo durante o ano']
                  : ['Ideal para estudos complementares']),
              ].map((feature, i) => (
                <li key={i} className="flex items-center text-sm text-gray-600">
                  <Check className="mr-2 h-5 w-5 shrink-0 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>

            <PurchaseButton
              year={year}
              priceId={pass.priceId}
              buttonText={`Adquirir Acesso ${year}`}
            />
          </div>
        );
      })}
    </div>
  );
}
