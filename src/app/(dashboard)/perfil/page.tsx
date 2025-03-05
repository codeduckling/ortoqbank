'use client';

import { useQuery } from 'convex/react';

import { Skeleton } from '@/components/ui/skeleton';

import { api } from '../../../../convex/_generated/api';
import { CorrectIncorrectChart } from './charts/correct-incorrect-chart';
import { PieChartDemo } from './charts/pie-chart-demo';
import { ThemeBarChart } from './charts/theme-bar-chart';
import { StatCard } from './components/stat-card';

export default function ProfilePage() {
  const stats = useQuery(api.userStats.getUserStats);

  const isLoading = stats === undefined;

  const hasThemeData = stats && stats.byTheme && stats.byTheme.length > 0;

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

      {/* Use a 3-column grid for larger screens */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          // Loading state for charts
          <>
            <Skeleton className="h-60 w-full rounded-lg" />
            <Skeleton className="h-60 w-full rounded-lg" />
            <Skeleton className="h-60 w-full rounded-lg lg:col-span-1" />
          </>
        ) : (
          <>
            <PieChartDemo
              correctCount={stats.overall.totalCorrect}
              incorrectCount={stats.overall.totalIncorrect}
              unansweredCount={stats.overall.totalUnanswered}
            />
            <CorrectIncorrectChart
              correctCount={stats.overall.totalCorrect}
              incorrectCount={stats.overall.totalIncorrect}
            />
            {hasThemeData ? (
              <div className="lg:col-span-1">
                <ThemeBarChart themeStats={stats.byTheme} />
              </div>
            ) : (
              <div className="bg-card text-card-foreground flex h-[220px] items-center justify-center rounded-lg border p-3 shadow-sm lg:col-span-1">
                <p className="text-muted-foreground text-sm">
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
