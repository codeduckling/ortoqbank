'use client';

import { useIsMobile } from '@/hooks/use-mobile';

import { CreateTestForm } from './create-test-form';
import { PieChartDemo } from './pie-chart-demo';
import { ThemeBarChart } from './theme-bar-chart';

export default function CriarTestePage() {
  const isMobile = useIsMobile();

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Criar Teste</h1>

      <div
        className={`mb-8 grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}
      >
        <PieChartDemo />
        <div className="row-span-1">
          <ThemeBarChart />
        </div>
      </div>

      <CreateTestForm />
    </div>
  );
}
