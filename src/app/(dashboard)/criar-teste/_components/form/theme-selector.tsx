'use client';

import { Toggle } from '@/components/ui/toggle';

import { Id } from '../../../../../../convex/_generated/dataModel';

interface Theme {
  _id: Id<'themes'>;
  name: string;
}

interface ThemeSelectorProps {
  themes: Theme[];
  selectedThemes: Set<Id<'themes'>>;
  selectedSubthemes: Record<Id<'themes'>, Set<Id<'subthemes'>>>;
  questionCounts: Record<string, number>;
  onThemeClick: (themeId: Id<'themes'>) => void;
}

export function ThemeSelector({
  themes,
  selectedThemes,
  selectedSubthemes,
  questionCounts,
  onThemeClick,
}: ThemeSelectorProps) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Temas</h2>
      <div className="flex flex-wrap gap-2">
        {themes.map(theme => (
          <Toggle
            key={theme._id}
            variant="primary"
            size="default"
            pressed={selectedThemes.has(theme._id)}
            onPressedChange={() => onThemeClick(theme._id)}
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
  );
}
