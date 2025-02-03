'use client';

import { ChevronDown, Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';

import { Id } from '../../../../../../../convex/_generated/dataModel';
import {
  useSubthemes,
  useThemeActions,
  useThemes,
  useThemeStore,
} from './store';
import { SubthemeDialog } from './subtheme-dialog';

export function ThemeList() {
  const themes = useThemes();
  const {
    setEditingTheme,
    setDialogOpen,
    setSubthemeDialogOpen,
    setActiveThemeId,
  } = useThemeStore();
  const { deleteTheme } = useThemeActions();
  const [openThemes, setOpenThemes] = useState<Set<string>>(new Set());

  const toggleTheme = (themeId: string) => {
    const newOpenThemes = new Set(openThemes);
    if (newOpenThemes.has(themeId)) {
      newOpenThemes.delete(themeId);
    } else {
      newOpenThemes.add(themeId);
    }
    setOpenThemes(newOpenThemes);
  };

  return (
    <div className="space-y-4">
      {themes.map((theme, index) => (
        <div key={theme._id}>
          {index > 0 && <Separator />}
          <Collapsible
            open={openThemes.has(theme._id)}
            onOpenChange={() => toggleTheme(theme._id)}
          >
            <div className="flex items-center justify-between py-4">
              <CollapsibleTrigger className="flex items-center gap-2">
                <ChevronDown className="h-4 w-4" />
                <span className="text-lg">{theme.name}</span>
                <span className="ml-2 text-sm text-muted-foreground">
                  ({theme.subthemeCount} subtemas)
                </span>
              </CollapsibleTrigger>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingTheme(theme);
                    setDialogOpen(true);
                  }}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteTheme(theme._id)}
                >
                  Excluir
                </Button>
              </div>
            </div>

            <CollapsibleContent className="pl-6">
              <SubthemeList themeId={theme._id} />
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setActiveThemeId(theme._id);
                  setSubthemeDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Subtema
              </Button>
            </CollapsibleContent>
          </Collapsible>
        </div>
      ))}

      <SubthemeDialog />
    </div>
  );
}

function SubthemeList({ themeId }: { themeId: Id<'themes'> }) {
  const subthemes = useSubthemes(themeId);

  return (
    <div className="space-y-2 py-2">
      {subthemes.map(subtheme => (
        <div key={subtheme._id} className="flex items-center gap-2">
          <span>{subtheme.name}</span>
          <Button variant="ghost" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
