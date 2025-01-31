import { PieChartDemo } from './_components/charts/pie-chart-demo';
import { ThemeBarChart } from './_components/charts/theme-bar-chart';
import { CreateTestForm } from './_components/form/create-test-form';

export default function CriarTestePage() {
  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Criar Teste</h1>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <PieChartDemo />
        <ThemeBarChart />
      </div>

      <CreateTestForm />
    </div>
  );
}
