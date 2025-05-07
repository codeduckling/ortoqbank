'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
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

  // Group subthemes by their parent theme
  const themeSubthemes = themes.reduce(
    (acc, theme) => {
      acc[theme._id] = subthemes.filter(s => s.themeId === theme._id) || [];
      return acc;
    },
    {} as Record<string, Subtheme[]>,
  );

  // Get groups for a subtheme
  const getSubthemeGroups = (subthemeId: string) =>
    groups.filter(g => g.subthemeId === subthemeId);

  // Toggle subtheme expansion state
  const toggleExpanded = (subthemeId: string) => {
    setExpandedSubthemes(prev =>
      prev.includes(subthemeId)
        ? prev.filter(id => id !== subthemeId)
        : [...prev, subthemeId],
    );
  };

  // Handle selecting/unselecting a subtheme and all its groups
  const handleSubthemeToggle = (subtheme: Subtheme) => {
    const subthemeGroups = getSubthemeGroups(subtheme._id);
    const isSelected = selectedSubthemes.includes(subtheme._id);

    // Toggle the subtheme itself
    onToggleSubtheme(subtheme._id);

    if (isSelected) {
      // Unselect all selected groups of this subtheme
      subthemeGroups
        .filter(group => selectedGroups.includes(group._id))
        .forEach(group => onToggleGroup(group._id));
    } else {
      // Select all unselected groups of this subtheme
      subthemeGroups
        .filter(group => !selectedGroups.includes(group._id))
        .forEach(group => onToggleGroup(group._id));
    }
  };

  // Component for individual subtheme item
  const SubthemeItem = ({ subtheme }: { subtheme: Subtheme }) => {
    const subthemeGroups = getSubthemeGroups(subtheme._id);
    const isSelected = selectedSubthemes.includes(subtheme._id);
    const hasGroups = subthemeGroups.length > 0;
    const isExpanded = expandedSubthemes.includes(subtheme._id);

    return (
      <div className="">
        <div className="flex items-center gap-2">
          <Checkbox
            id={subtheme._id}
            checked={isSelected}
            onCheckedChange={() => handleSubthemeToggle(subtheme)}
            className="mt-0.5 flex-shrink-0"
          />
          <div className="min-w-0">
            <Label
              htmlFor={subtheme._id}
              className="text-sm font-medium hyphens-auto"
            >
              {subtheme.name}
            </Label>
          </div>
          {hasGroups && (
            <button
              onClick={() => toggleExpanded(subtheme._id)}
              className="text-muted-foreground hover:text-foreground flex-shrink-0 text-center"
              type="button"
              aria-label={isExpanded ? 'Collapse groups' : 'Expand groups'}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {hasGroups && isExpanded && (
          <div className="mt-3 space-y-2 pl-6">
            {subthemeGroups.map(group => (
              <div key={group._id} className="flex items-start gap-2">
                <Checkbox
                  id={group._id}
                  checked={selectedGroups.includes(group._id)}
                  onCheckedChange={() => onToggleGroup(group._id)}
                  className="mt-0.5 flex-shrink-0"
                />
                <Label
                  htmlFor={group._id}
                  className="min-w-0 flex-1 text-sm hyphens-auto"
                >
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
    <div className="space-y-6">
      <h3 className="text-sm font-medium">Subtemas</h3>
      {selectedThemes.map(themeId => {
        const theme = themes.find(t => t._id === themeId);
        const themeSubthemesList = themeSubthemes[themeId] || [];

        return themeSubthemesList.length > 0 ? (
          <div key={themeId} className="space-y-3">
            <h4 className="text-muted-foreground text-sm font-medium hyphens-auto">
              {theme?.name}
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {themeSubthemesList.map(subtheme => (
                <SubthemeItem key={subtheme._id} subtheme={subtheme} />
              ))}
            </div>
          </div>
        ) : undefined;
      })}
    </div>
  );
}
