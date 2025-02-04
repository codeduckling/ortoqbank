'use client';

import { useQuery } from 'convex/react';
import { InfoIcon as InfoCircle, Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';

import { api } from '../../../../../../convex/_generated/api';

type Theme = {
  _id: string;
  name: string;
};

type Subtheme = {
  _id: string;
  name: string;
  themeId: string;
};

type Group = {
  _id: string;
  name: string;
  subthemeId: string;
};

export default function TestForm() {
  const [testMode, setTestMode] = useState('tutor');
  const [expandedSubthemes, setExpandedSubthemes] = useState<string[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);

  // Fetch hierarchical data
  const hierarchicalData = useQuery(api.themes.getHierarchicalData);
  const { themes, subthemes, groups } = hierarchicalData ?? {
    themes: [],
    subthemes: [],
    groups: [],
  };

  const toggleSubtheme = (subthemeId: string) => {
    setExpandedSubthemes(previous =>
      previous.includes(subthemeId)
        ? previous.filter(id => id !== subthemeId)
        : [...previous, subthemeId],
    );
  };

  const expandAll = () => {
    if (!subthemes) return;

    setExpandedSubthemes(previous =>
      previous.length === subthemes.length ? [] : subthemes.map(s => s._id),
    );
  };

  const toggleTheme = (themeId: string) => {
    setSelectedThemes(previous =>
      previous.includes(themeId)
        ? previous.filter(id => id !== themeId)
        : [...previous, themeId],
    );
  };

  const SubthemeItem = ({ subtheme }: { subtheme: Subtheme }) => {
    const subthemeGroups = groups?.filter(g => g.subthemeId === subtheme._id);

    return (
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Checkbox id={subtheme._id} />
            <Label htmlFor={subtheme._id} className="truncate text-sm">
              {subtheme.name}
            </Label>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <InfoCircle className="h-4 w-4 text-muted-foreground" />
            <button
              onClick={() => toggleSubtheme(subtheme._id)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        {expandedSubthemes.includes(subtheme._id) && (
          <div className="space-y-1 pl-6">
            {subthemeGroups?.map(group => (
              <div key={group._id} className="flex items-center gap-2">
                <Checkbox id={group._id} />
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

  // Group subthemes by theme for the two-column layout
  const themeSubthemes = themes?.reduce<Record<string, Subtheme[]>>(
    (accumulator, theme) => {
      accumulator[theme._id] =
        subthemes?.filter(s => s.themeId === theme._id) ?? [];
      return accumulator;
    },
    {},
  );

  // Split themes into two arrays for the columns
  const themesArray = Object.entries(themeSubthemes ?? {});
  const midPoint = Math.ceil(themesArray.length / 2);
  const leftColumnThemes = themesArray.slice(0, midPoint);
  const rightColumnThemes = themesArray.slice(midPoint);

  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardContent className="space-y-12 p-4 sm:space-y-14 sm:p-6">
        {/* Avaliação (previously Test Mode) */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-medium">Avaliação</h3>
            <InfoCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={testMode === 'tutor'}
                onCheckedChange={() => setTestMode('tutor')}
              />
              <Label className="text-sm">Tutor</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={testMode === 'timed'}
                onCheckedChange={() => setTestMode('timed')}
              />
              <Label className="text-sm">Timed</Label>
            </div>
          </div>
        </div>

        {/* Modo (previously Question Mode) */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-medium">Modo</h3>
            <InfoCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          <RadioGroup
            defaultValue="unused"
            className="flex flex-wrap gap-2 sm:gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unused" id="unused" />
              <Label htmlFor="unused">
                Unused{' '}
                <span className="ml-1 rounded bg-secondary px-1.5 py-0.5 text-xs">
                  3896
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="incorrect" id="incorrect" />
              <Label htmlFor="incorrect">
                Incorrect{' '}
                <span className="ml-1 rounded bg-secondary px-1.5 py-0.5 text-xs">
                  30
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="marked" id="marked" />
              <Label htmlFor="marked">
                Marked{' '}
                <span className="ml-1 rounded bg-secondary px-1.5 py-0.5 text-xs">
                  3
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all">
                All{' '}
                <span className="ml-1 rounded bg-secondary px-1.5 py-0.5 text-xs">
                  3928
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom">Custom</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Themes */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-medium">Temas</h3>
            <InfoCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {themes?.map(theme => (
              <Button
                key={theme._id}
                onClick={() => toggleTheme(theme._id)}
                variant={
                  selectedThemes.includes(theme._id) ? 'default' : 'outline'
                }
                className="h-auto justify-start py-2"
              >
                <div className="flex flex-col items-start">
                  <span className="text-sm">{theme.name}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Subtemas */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">Subtemas</h3>
              <InfoCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <button
              onClick={expandAll}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Expandir Todos</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
            <div className="space-y-2">
              {leftColumnThemes.map(([themeId, themeSubthemes]) =>
                themeSubthemes.map(subtheme => (
                  <SubthemeItem key={subtheme._id} subtheme={subtheme} />
                )),
              )}
            </div>
            <div className="space-y-2">
              {rightColumnThemes.map(([themeId, themeSubthemes]) =>
                themeSubthemes.map(subtheme => (
                  <SubthemeItem key={subtheme._id} subtheme={subtheme} />
                )),
              )}
            </div>
          </div>
        </div>

        {/* No. of Questions */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-medium">No. of Questions</h3>
            <InfoCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Input type="number" defaultValue="0" className="w-20" />
            <span className="text-sm text-muted-foreground">
              Max allowed per block: 0
            </span>
          </div>
        </div>

        <Button className="w-full bg-blue-500 hover:bg-blue-600">
          Generate Test
        </Button>
      </CardContent>
    </Card>
  );
}
