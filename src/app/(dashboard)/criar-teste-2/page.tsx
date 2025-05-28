import { Metadata } from 'next';

import TaxonomyForm from './_components/form/TaxonomyForm';

export const metadata: Metadata = {
  title: 'Criar Teste v2 (Nova Taxonomia) | OrtoQBank',
  description:
    'Crie um teste personalizado com o novo sistema de taxonomia unificado',
};

export default function CriarTeste2Page() {
  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          Criar Teste Personalizado v2 (Nova Taxonomia)
        </h1>
        <p className="text-muted-foreground">
          Configure seu teste usando o novo sistema de taxonomia unificado com
          filtragem otimizada e estrutura hierárquica aprimorada
        </p>
      </div>
      <TaxonomyForm />
    </div>
  );
}
