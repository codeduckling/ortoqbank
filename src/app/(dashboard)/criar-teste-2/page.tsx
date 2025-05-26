import { Metadata } from 'next';

import TestForm from './_components/form/form';

export const metadata: Metadata = {
  title: 'Criar Teste v2 | OrtoQBank',
  description: 'Crie um teste personalizado com a nova lógica de filtragem',
};

export default function CriarTeste2Page() {
  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Criar Teste Personalizado v2</h1>
        <p className="text-muted-foreground">
          Configure seu teste selecionando temas, subtemas e grupos com a nova
          lógica de filtragem otimizada
        </p>
      </div>
      <TestForm />
    </div>
  );
}
