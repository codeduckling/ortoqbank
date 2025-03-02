'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { PieChartDemo } from './charts/pie-chart-demo';
import { ThemeBarChart } from './charts/theme-bar-chart';
import { StatCard } from './components/stat-card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const stats = useQuery(api.userStats.getUserStats);

  const isLoading = stats === undefined;

  const hasThemeData = stats && stats.byTheme && stats.byTheme.length > 0;

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-semibold">Meu Perfil</h1>

      {isLoading ? (
        // Loading state
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        // Stats cards
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <StatCard
            title="Questões Respondidas"
            value={stats.overall.totalAnswered}
            description={`${stats.overall.totalUnanswered} ainda não respondidas`}
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
            title="Total de Temas"
            value={stats.byTheme.length}
            description="Temas estudados"
            color="purple"
          />
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {isLoading ? (
          // Loading state for charts
          <>
            <Skeleton className="h-80 w-full rounded-lg" />
            <Skeleton className="h-80 w-full rounded-lg" />
          </>
        ) : (
          <>
            <PieChartDemo
              correctCount={stats.overall.totalCorrect}
              incorrectCount={stats.overall.totalIncorrect}
              unansweredCount={stats.overall.totalUnanswered}
            />
            {hasThemeData ? (
              <ThemeBarChart themeStats={stats.byTheme} />
            ) : (
              <div className="bg-card text-card-foreground flex h-80 items-center justify-center rounded-lg border p-4 shadow-sm">
                <p className="text-muted-foreground">
                  Não há dados suficientes sobre temas para exibir o gráfico.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
