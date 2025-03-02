'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ThemeStats {
  themeId: string;
  themeName: string;
  total: number;
  correct: number;
  percentage: number;
}

interface ThemeBarChartProps {
  themeStats: ThemeStats[];
}

export function ThemeBarChart({ themeStats = [] }: ThemeBarChartProps) {
  // Get top 10 themes by question count
  const data = (themeStats || []).slice(0, 10).map(theme => ({
    name: theme.themeName,
    percentage: theme.percentage,
    total: theme.total,
  }));

  return (
    <div className="bg-card text-card-foreground rounded-lg border p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Desempenho por Tema</h3>
        <p className="text-muted-foreground text-sm">
          Porcentagem de acerto por tema
        </p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              tickFormatter={value =>
                value.length > 15 ? `${value.slice(0, 15)}...` : value
              }
            />
            <YAxis tickFormatter={value => `${value}%`} domain={[0, 100]} />
            <Tooltip
              formatter={(value, name) => {
                if (name === 'percentage')
                  return [`${value}%`, 'Taxa de Acerto'];
                return [`${value} questões`, 'Total de Questões'];
              }}
              labelFormatter={label => `Tema: ${label}`}
            />
            <Legend />
            <Bar
              name="Taxa de Acerto"
              dataKey="percentage"
              radius={[4, 4, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.percentage > 70
                      ? '#4ade80'
                      : (entry.percentage > 40
                        ? '#facc15'
                        : '#f87171')
                  }
                />
              ))}
            </Bar>
            <Bar
              name="Total de Questões"
              dataKey="total"
              fill="#93c5fd"
              radius={[4, 4, 0, 0]}
              opacity={0.7}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
