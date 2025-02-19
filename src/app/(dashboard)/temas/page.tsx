'use client';

import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import {
  Baby,
  Bone,
  CircleArrowOutDownRight,
  Dna,
  Footprints,
  Hand,
  Rotate3d,
  TrainTrack,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

const THEME_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Tumores: Dna,
  Mão: Hand,
  Coluna: TrainTrack,
  'Ombro e Cotovelo': Rotate3d,
  Joelho: Bone,
  Quadril: CircleArrowOutDownRight,
  'Ortopedia Pediátrica': Baby,
  'Pé e Tornozelo': Footprints,
  'Ciências Básicas': Wrench,
};

export default function ThemesPage() {
  const themes = useQuery(api.themes.list) || [];
  const presetQuizzes = useQuery(api.presetQuizzes.list) || [];
  const startSession = useMutation(api.quizSessions.startQuizSession);

  const router = useRouter();

  // Group exams by theme
  const examsByTheme = themes.reduce(
    (accumulator, theme) => {
      accumulator[theme._id] = presetQuizzes.filter(
        quiz => quiz.themeId === theme._id,
      );
      return accumulator;
    },
    {} as Record<string, typeof presetQuizzes>,
  );

  const handleExamClick = async (quizId: Id<'presetQuizzes'>) => {
    await startSession({
      presetQuizId: quizId,
    });
    router.push(`/temas/${quizId}`);
  };

  if (!themes) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Temas</h1>
      <Accordion type="single" collapsible className="space-y-4">
        {themes?.map(theme => {
          const Icon = THEME_ICONS[theme.name] || Dna;
          const themeExams = examsByTheme[theme._id] || [];

          return (
            <AccordionItem key={theme._id} value={theme._id}>
              <AccordionTrigger className="rounded-lg px-4 hover:bg-gray-50 hover:no-underline">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <span>{theme.name}</span>
                  <span className="text-muted-foreground text-sm">
                    ({themeExams.length} testes)
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="mt-2 ml-8 space-y-2">
                  {themeExams.map(exam => (
                    <div
                      key={exam._id}
                      onClick={() => handleExamClick(exam._id)}
                      className="block cursor-pointer rounded-lg border p-3 text-sm hover:bg-gray-50"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{exam.name}</span>
                        <span className="text-muted-foreground">
                          {exam.description}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {exam.questions.length} questões
                        </span>
                      </div>
                    </div>
                  ))}
                  {themeExams.length === 0 && (
                    <div className="text-muted-foreground text-sm">
                      Nenhum teste disponível para este tema
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
