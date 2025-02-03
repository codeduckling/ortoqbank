'use client';

import { useQuery } from 'convex/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { api } from '../../../../../../convex/_generated/api';
import { Id } from '../../../../../../convex/_generated/dataModel';
import { ModeSelector } from './mode-selector';
import { SubthemeDialog } from './subtheme-dialog';
import { ThemeSelector } from './theme-selector';

type SelectedSubthemes = Record<Id<'themes'>, Set<Id<'subthemes'>>>;

export function CreateTestForm() {
  const [isSimulado, setIsSimulado] = useState(true);
  const [selectedThemes, setSelectedThemes] = useState<Set<Id<'themes'>>>(
    new Set(),
  );
  const [selectedSubthemes, setSelectedSubthemes] = useState<SelectedSubthemes>(
    {},
  );
  const [dialogTheme, setDialogTheme] = useState<Id<'themes'> | undefined>();

  // Let Convex handle caching
  const themes = useQuery(api.themes.list) ?? [];
  const allSubthemes = useQuery(api.themes.listAllSubthemes) ?? [];
  const questionCounts = useQuery(api.questions.getThemeCounts) ?? {};

  const handleThemeClick = (themeId: Id<'themes'>) => {
    setDialogTheme(themeId);
    if (!selectedThemes.has(themeId)) {
      const newSelectedThemes = new Set(selectedThemes);
      newSelectedThemes.add(themeId);
      setSelectedThemes(newSelectedThemes);
      setSelectedSubthemes({
        ...selectedSubthemes,
        [themeId]: new Set(),
      });
    }
  };

  const handleSubthemeSelect = (
    themeId: Id<'themes'>,
    subthemeId: Id<'subthemes'>,
  ) => {
    const themeSubthemes = selectedSubthemes[themeId] ?? new Set();
    const newThemeSubthemes = new Set(themeSubthemes);

    if (themeSubthemes.has(subthemeId)) {
      newThemeSubthemes.delete(subthemeId);
    } else {
      newThemeSubthemes.add(subthemeId);
    }

    setSelectedSubthemes({
      ...selectedSubthemes,
      [themeId]: newThemeSubthemes,
    });
  };

  const handleDialogClose = () => {
    const themeId = dialogTheme;
    setDialogTheme(undefined);

    // Remove theme if no subthemes selected
    if (
      themeId &&
      (!selectedSubthemes[themeId] || selectedSubthemes[themeId].size === 0)
    ) {
      const newSelectedThemes = new Set(selectedThemes);
      newSelectedThemes.delete(themeId);
      setSelectedThemes(newSelectedThemes);
      const { [themeId]: _, ...rest } = selectedSubthemes;
      setSelectedSubthemes(rest);
    }
  };

  const handleSubmit = () => {
    const selection = [...selectedThemes].map(themeId => ({
      themeId,
      subthemeIds: [...(selectedSubthemes[themeId] ?? new Set())],
    }));

    console.log({
      mode: isSimulado ? 'simulado' : 'tutor',
      selection,
    });
  };

  const hasSelections = [...selectedThemes].some(
    themeId => (selectedSubthemes[themeId]?.size ?? 0) > 0,
  );

  return (
    <div className="space-y-8">
      <ModeSelector isSimulado={isSimulado} onModeChange={setIsSimulado} />

      <ThemeSelector
        themes={themes}
        selectedThemes={selectedThemes}
        selectedSubthemes={selectedSubthemes}
        questionCounts={questionCounts}
        onThemeClick={handleThemeClick}
      />

      <SubthemeDialog
        dialogTheme={dialogTheme}
        themes={themes}
        allSubthemes={allSubthemes}
        selectedSubthemes={selectedSubthemes}
        onClose={handleDialogClose}
        onSubthemeSelect={handleSubthemeSelect}
      />

      <div className="flex items-center justify-between">
        <Button
          onClick={handleSubmit}
          disabled={!hasSelections}
          className={cn(
            'bg-[hsl(var(--sidebar-background))]',
            'hover:bg-[hsl(var(--sidebar-background))/0.9]',
          )}
        >
          Gerar Teste
        </Button>
      </div>
    </div>
  );
}
