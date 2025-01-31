'use client';

import { useQuery } from 'convex/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';

import { api } from '../../../../../../convex/_generated/api';
import { Id } from '../../../../../../convex/_generated/dataModel';

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
      <div>
        <h2 className="mb-4 text-lg font-semibold">Modo</h2>
        <Tabs
          value={isSimulado ? 'simulado' : 'tutor'}
          onValueChange={value => setIsSimulado(value === 'simulado')}
        >
          <TabsList>
            <TabsTrigger value="simulado">Simulado</TabsTrigger>
            <TabsTrigger value="tutor">Tutor</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Temas</h2>
        <div className="flex flex-wrap gap-2">
          {themes.map(theme => (
            <Toggle
              key={theme._id}
              variant="primary"
              size="default"
              pressed={selectedThemes.has(theme._id)}
              onPressedChange={() => handleThemeClick(theme._id)}
            >
              {theme.name}
              <span className="ml-2 text-xs opacity-70">
                ({questionCounts[theme.name] ?? 0})
              </span>
              {selectedSubthemes[theme._id]?.size > 0 && (
                <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-xs">
                  {selectedSubthemes[theme._id].size} selecionados
                </span>
              )}
            </Toggle>
          ))}
        </div>
      </div>

      <Dialog
        open={dialogTheme !== null}
        onOpenChange={() => handleDialogClose()}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Subtemas de {themes.find(t => t._id === dialogTheme)?.name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-2">
              {dialogTheme &&
                allSubthemes
                  .filter(sub => sub.themeId === dialogTheme)
                  .map(subtheme => (
                    <div
                      key={subtheme._id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={subtheme._id}
                        checked={selectedSubthemes[dialogTheme]?.has(
                          subtheme._id,
                        )}
                        onCheckedChange={() =>
                          handleSubthemeSelect(dialogTheme, subtheme._id)
                        }
                      />
                      <label
                        htmlFor={subtheme._id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {subtheme.name}
                      </label>
                    </div>
                  ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

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
