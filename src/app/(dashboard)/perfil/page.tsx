'use client';

import { useQuery } from 'convex/react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { Skeleton } from '@/components/ui/skeleton';

import { api } from '../../../../convex/_generated/api';
import { ThemeBarChart } from './charts/theme-bar-chart';
import { StatCard } from './components/stat-card';

export default function ProfilePage() {
  const stats = useQuery(api.userStats.getUserStatsFromTable);

  const isLoading = stats === undefined;

  const hasThemeData = stats && stats.byTheme && stats.byTheme.length > 0;

  // Calculate completion percentage
  const completionPercentage = !isLoading
    ? Math.round((stats.overall.totalAnswered / stats.totalQuestions) * 100)
    : 0;

  // Prepare data for the progress pie chart
  const progressData = !isLoading
    ? [
        {
          name: 'Respondidas',
          value: stats.overall.totalAnswered,
          color: '#3b82f6', // blue
        },
        {
          name: 'Não Respondidas',
          value: stats.totalQuestions - stats.overall.totalAnswered,
          color: '#e5e7eb', // light gray
        },
      ]
    : [];

  // Prepare data for the correctness pie chart
  const correctnessData = !isLoading
    ? [
        {
          name: 'Corretas',
          value: stats.overall.totalCorrect,
          color: '#22c55e', // green
        },
        {
          name: 'Incorretas',
          value: stats.overall.totalIncorrect,
          color: '#ef4444', // red
        },
      ]
    : [];

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-xl font-semibold">Meu Perfil</h1>

      {isLoading ? (
        // Loading state
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        // Stats cards
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard
            title="Questões Respondidas"
            value={stats.overall.totalAnswered}
            description={`${completionPercentage}% do banco de questões (${stats.totalQuestions} total)`}
            color="blue"
          />
          <StatCard
            title="Taxa de Acerto"
            value={`${stats.overall.correctPercentage}%`}
            description={`${stats.overall.totalCorrect} respostas corretas`}
            color="green"
          />
          <StatCard
            title="Taxa de Erro"
            value={`${100 - stats.overall.correctPercentage}%`}
            description={`${stats.overall.totalIncorrect} respostas incorretas`}
            color="red"
          />
          <StatCard
            title="Questões Salvas"
            value={stats.overall.totalBookmarked}
            description="Questões marcadas para revisão"
            color="purple"
          />
        </div>
      )}

      {/* Use a 2-column grid for charts */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {isLoading ? (
          // Loading state for charts
          <>
            <Skeleton className="h-60 w-full rounded-lg" />
            <Skeleton className="h-60 w-full rounded-lg" />
          </>
        ) : (
          <>
            {/* Progress Pie Chart */}
            <div className="bg-card text-card-foreground rounded-lg border p-4 shadow-sm">
              <div className="mb-2">
                <h3 className="text-md font-semibold">Progresso Geral</h3>
                <p className="text-muted-foreground text-xs">
                  Questões respondidas de {stats.totalQuestions} no total
                </p>
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={progressData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={60}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {progressData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={value => [`${value} questões`, '']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Correctness Pie Chart */}
            <div className="bg-card text-card-foreground rounded-lg border p-4 shadow-sm">
              <div className="mb-2">
                <h3 className="text-md font-semibold">Desempenho</h3>
                <p className="text-muted-foreground text-xs">
                  Respostas Corretas vs Incorretas
                </p>
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={correctnessData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={60}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {correctnessData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={value => [`${value} questões`, '']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Theme stats */}
      {!isLoading && (
        <div className="mb-6">
          {hasThemeData ? (
            <ThemeBarChart themeStats={stats.byTheme} />
          ) : (
            <div className="bg-card text-card-foreground flex h-[220px] items-center justify-center rounded-lg border p-3 shadow-sm">
              <p className="text-muted-foreground text-sm">
                Não há dados suficientes sobre temas para exibir o gráfico.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
