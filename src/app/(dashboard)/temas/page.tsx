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
  const presetExams = useQuery(api.presetExams.list) || [];
  const startSession = useMutation(api.quizSessions.create);
  const activeSession = useQuery(api.quizSessions.getActiveSession);
  const router = useRouter();

  // Group exams by theme
  const examsByTheme = themes.reduce(
    (accumulator, theme) => {
      accumulator[theme._id] = presetExams.filter(
        exam => exam.themeId === theme._id,
      );
      return accumulator;
    },
    {} as Record<string, typeof presetExams>,
  );

  const handleExamClick = async (examId: Id<'presetExams'>) => {
    // If there's an active session for this exam, just navigate to it
    if (activeSession?.presetExamId === examId) {
      router.push(`/temas/${examId}`);
      return;
    }

    // If there's an active session for another exam, don't create a new one
    if (activeSession) {
      // Optionally show a message that they need to complete or cancel the other session first
      return;
    }

    // Create new session only if there's no active session
    await startSession({
      presetExamId: examId,
    });
    router.push(`/temas/${examId}`);
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
