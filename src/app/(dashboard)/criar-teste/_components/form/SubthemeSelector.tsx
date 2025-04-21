'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type Theme = { _id: string; name: string };
type Subtheme = { _id: string; name: string; themeId: string };
type Group = { _id: string; name: string; subthemeId: string };

type SubthemeSelectorProps = {
  themes: Theme[];
  subthemes: Subtheme[];
  groups: Group[];
  selectedThemes: string[];
  selectedSubthemes: string[];
  selectedGroups: string[];
  onToggleSubtheme: (subthemeId: string) => void;
  onToggleGroup: (groupId: string) => void;
};

export function SubthemeSelector({
  themes,
  subthemes,
  groups,
  selectedThemes,
  selectedSubthemes,
  selectedGroups,
  onToggleSubtheme,
  onToggleGroup,
}: SubthemeSelectorProps) {
  const [expandedSubthemes, setExpandedSubthemes] = useState<string[]>([]);

  const toggleExpandedSubtheme = (subthemeId: string) => {
    setExpandedSubthemes(previous =>
      previous.includes(subthemeId)
        ? previous.filter(id => id !== subthemeId)
        : [...previous, subthemeId],
    );
  };

  // Simple grouping of subthemes by theme
  const themeSubthemes = themes?.reduce<Record<string, Subtheme[]>>(
    (accumulator, theme) => {
      accumulator[theme._id] =
        subthemes?.filter(s => s.themeId === theme._id) ?? [];
      return accumulator;
    },
    {},
  );

  const SubthemeItem = ({ subtheme }: { subtheme: Subtheme }) => {
    const subthemeGroups = groups?.filter(g => g.subthemeId === subtheme._id);
    const isSelected = selectedSubthemes.includes(subtheme._id);
    const hasGroups = subthemeGroups && subthemeGroups.length > 0;

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Checkbox
            id={subtheme._id}
            checked={isSelected}
            onCheckedChange={() => onToggleSubtheme(subtheme._id)}
          />
          <Label htmlFor={subtheme._id} className="flex-1 truncate text-sm">
            {subtheme.name}
          </Label>
          {hasGroups && (
            <button
              onClick={() => toggleExpandedSubtheme(subtheme._id)}
              className="text-muted-foreground hover:text-foreground"
              type="button"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
        {hasGroups && expandedSubthemes.includes(subtheme._id) && (
          <div className="space-y-1 pl-6">
            {subthemeGroups.map(group => (
              <div key={group._id} className="flex items-center gap-2">
                <Checkbox
                  id={group._id}
                  checked={selectedGroups.includes(group._id)}
                  onCheckedChange={() => onToggleGroup(group._id)}
                />
                <Label htmlFor={group._id} className="text-sm">
                  {group.name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Subtemas</h3>
      {selectedThemes.map(themeId => {
        const theme = themes?.find(t => t._id === themeId);
        const themeSubthemesList = themeSubthemes?.[themeId] ?? [];

        return (
          <div key={themeId} className="space-y-2">
            <h4 className="text-muted-foreground text-sm font-medium">
              {theme?.name}
            </h4>
            <div className="xs:grid-cols-2 grid grid-cols-1 gap-4">
              {themeSubthemesList.map(subtheme => (
                <SubthemeItem key={subtheme._id} subtheme={subtheme} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
