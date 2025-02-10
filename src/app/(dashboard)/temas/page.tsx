'use client';

import { useQuery } from 'convex/react';
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

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { api } from '../../../../convex/_generated/api';

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
  const themes = useQuery(api.themes.list);
  const subthemesByTheme = useQuery(api.subthemes.listByThemes);

  if (!themes) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Temas</h1>
      <Accordion type="single" collapsible className="space-y-4">
        {themes?.map(theme => {
          const Icon = THEME_ICONS[theme.name] || Dna;
          const themeSubthemes = subthemesByTheme?.filter(
            s => s.themeId === theme._id,
          );

          return (
            <AccordionItem key={theme._id} value={theme._id}>
              <AccordionTrigger className="rounded-lg px-4 hover:bg-gray-50 hover:no-underline">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <span>{theme.name}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="mt-2 ml-8 space-y-2">
                  {themeSubthemes?.map(subtheme => (
                    <Link
                      key={subtheme._id}
                      href={`/temas/${theme._id}`}
                      className="block rounded-lg border p-3 text-sm hover:bg-gray-50"
                    >
                      {subtheme.name}
                    </Link>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
