'use client';

import { useQuery } from 'convex/react';
import { useEffect, useState } from 'react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { api } from '../../../../convex/_generated/api';
import { ThemeBarChart } from './charts/theme-bar-chart';
import { StatCard } from './components/stat-card';

export default function ProfilePage() {
  // Use the lightweight summary stats function for initial load
  const statsSummary = useQuery(api.userStats.getUserStatsSummary);
  const [showThemeStats, setShowThemeStats] = useState(false);

  // Only fetch full stats with theme data when requested
  const fullStats = useQuery(
    api.userStats.getUserStatsFromTable,
    showThemeStats ? {} : 'skip',
  );

  // Determine if we're loading the initial summary data
  const isLoadingSummary = statsSummary === undefined;

  // Determine if we're loading the full theme data
  const isLoadingThemeData = showThemeStats && fullStats === undefined;

  // Check if we have theme data available
  const hasThemeData =
    fullStats && fullStats.byTheme && fullStats.byTheme.length > 0;

  // Use the appropriate stats object for calculations
  const stats = showThemeStats && fullStats ? fullStats : statsSummary;

  // Calculate completion percentage
  const completionPercentage =
    !stats || stats.totalQuestions === 0
      ? 0
      : Math.round((stats.overall.totalAnswered / stats.totalQuestions) * 100);

  // Prepare data for the progress pie chart
  const progressData = stats
    ? [
        {
          name: 'Respondidas',
          value: stats.overall.totalAnswered,
          color: '#3b82f6', // blue
        },
        {
          name: 'Não Respondidas',
          value: stats.totalQuestions - stats.overall.totalAnswered,
          color: '#f97316', // orange
        },
      ]
    : [];

  // Prepare data for the correctness pie chart
  const correctnessData = stats
    ? [
        {
          name: 'Corretas',
          value: stats.overall.totalCorrect,
          color: '#3b82f6', // blue
        },
        {
          name: 'Incorretas',
          value: stats.overall.totalIncorrect,
          color: '#f97316', // orange
        },
      ]
    : [];

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
        Meu Perfil
      </h1>

      {isLoadingSummary ? (
        // Loading state
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : stats ? (
        // Stats cards - only render if stats are available
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard
            title="Questões Respondidas"
            value={stats.overall.totalAnswered}
            description={`${completionPercentage}% do banco de questões (${stats.totalQuestions} total)`}
            color="white"
          />
          <StatCard
            title="Taxa de Acerto"
            value={`${stats.overall.correctPercentage}%`}
            description={`${stats.overall.totalCorrect} respostas corretas`}
            color="white"
          />

          <StatCard
            title="Questões Salvas"
            value={stats.overall.totalBookmarked}
            description="Questões marcadas para revisão"
            color="white"
          />
        </div>
      ) : undefined}

      {/* Use a 2-column grid for charts */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {isLoadingSummary ? (
          // Loading state for charts
          <>
            <Skeleton className="h-60 w-full rounded-lg" />
            <Skeleton className="h-60 w-full rounded-lg" />
          </>
        ) : stats ? (
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
        ) : undefined}
      </div>

      {/* Theme stats - only show after user requests them */}
      {!isLoadingSummary && !showThemeStats && stats && (
        <div className="mt-6 flex justify-center">
          <Button onClick={() => setShowThemeStats(true)} variant="outline">
            Carregar estatísticas por tema
          </Button>
        </div>
      )}

      {showThemeStats && (
        <div className="mb-6">
          {isLoadingThemeData ? (
            <Skeleton className="h-[300px] w-full rounded-lg" />
          ) : hasThemeData && fullStats ? (
            <ThemeBarChart themeStats={fullStats.byTheme} />
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
