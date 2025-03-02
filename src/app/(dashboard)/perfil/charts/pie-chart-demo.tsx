'use client';

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface PieChartDemoProps {
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
}

export function PieChartDemo({
  correctCount,
  incorrectCount,
  unansweredCount,
}: PieChartDemoProps) {
  const data = [
    { name: 'Corretas', value: correctCount, color: '#4ade80' },
    { name: 'Incorretas', value: incorrectCount, color: '#f87171' },
    { name: 'Não Respondidas', value: unansweredCount, color: '#93c5fd' },
  ];

  return (
    <div className="bg-card text-card-foreground rounded-lg border p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Distribuição de Respostas</h3>
        <p className="text-muted-foreground text-sm">
          Visão geral do seu desempenho
        </p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={value => [`${value} questões`, '']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
