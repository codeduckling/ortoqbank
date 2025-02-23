import { PieChartDemo } from './charts/pie-chart-demo';
import { ThemeBarChart } from './charts/theme-bar-chart';

export default function ProfilePage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-semibold">Meu Perfil</h1>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <PieChartDemo />
        <ThemeBarChart />
      </div>
    </div>
  );
}
