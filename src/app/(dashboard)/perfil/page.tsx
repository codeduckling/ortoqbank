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

// Helper function to safely extract values regardless of stats type
function getStatsValues(stats: any) {
  if (!stats) return;

  // Check if we have the new flat structure (UserStatsSummary)
  if ('totalAnswered' in stats) {
    return {
      totalAnswered: stats.totalAnswered,
      totalCorrect: stats.totalCorrect,
      totalIncorrect: stats.totalIncorrect,
      totalBookmarked: stats.totalBookmarked,
      correctPercentage: stats.correctPercentage,
      totalQuestions: stats.totalQuestions,
    };
  }

  // Otherwise we have the nested structure (UserStats)
  if (stats.overall) {
    return {
      totalAnswered: stats.overall.totalAnswered,
      totalCorrect: stats.overall.totalCorrect,
      totalIncorrect: stats.overall.totalIncorrect,
      totalBookmarked: stats.overall.totalBookmarked,
      correctPercentage: stats.overall.correctPercentage,
      totalQuestions: stats.totalQuestions,
    };
  }

  return;
}

export default function ProfilePage() {
  // Use the lightweight summary stats function with aggregates for initial load
  const statsSummary = useQuery(
    api.userStats.getUserStatsSummaryWithAggregates,
  );
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

  // Extract the values safely
  const values = getStatsValues(stats);

  // Use extracted values or defaults
  const totalAnswered = values?.totalAnswered || 0;
  const totalCorrect = values?.totalCorrect || 0;
  const totalIncorrect = values?.totalIncorrect || 0;
  const totalBookmarked = values?.totalBookmarked || 0;
  const correctPercentage = values?.correctPercentage || 0;
  const totalQuestions = values?.totalQuestions || 0;

  // Calculate completion percentage
  const completionPercentage =
    !values || totalQuestions === 0
      ? 0
      : Math.round((totalAnswered / totalQuestions) * 100);

  // Prepare data for the progress pie chart
  const progressData = values
    ? [
        {
          name: 'Respondidas',
          value: totalAnswered,
          color: '#3b82f6', // blue
        },
        {
          name: 'Não Respondidas',
          value: totalQuestions - totalAnswered,
          color: '#f97316', // orange
        },
      ]
    : [];

  // Prepare data for the correctness pie chart
  const correctnessData = values
    ? [
        {
          name: 'Corretas',
          value: totalCorrect,
          color: '#3b82f6', // blue
        },
        {
          name: 'Incorretas',
          value: totalIncorrect,
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
      ) : values ? (
        // Stats cards - only render if stats are available
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard
            title="Questões Respondidas"
            value={totalAnswered}
            description={`${completionPercentage}% do banco de questões (${totalQuestions} total)`}
            color="white"
          />
          <StatCard
            title="Taxa de Acerto"
            value={`${correctPercentage}%`}
            description={`${totalCorrect} respostas corretas`}
            color="white"
          />

          <StatCard
            title="Questões Salvas"
            value={totalBookmarked}
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
        ) : values ? (
          <>
            {/* Progress Pie Chart */}
            <div className="bg-card text-card-foreground rounded-lg border p-4 shadow-sm">
              <div className="mb-2">
                <h3 className="text-md font-semibold">Progresso Geral</h3>
                <p className="text-muted-foreground text-xs">
                  Questões respondidas de {totalQuestions} no total
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
      {!isLoadingSummary && !showThemeStats && values && (
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
