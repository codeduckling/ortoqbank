'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from 'convex/react';
import { InfoIcon as InfoCircle, Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { api } from '../../../../../../convex/_generated/api';
import { type TestFormData, testFormSchema } from '../schema';

type Theme = { _id: string; name: string };

type Subtheme = { _id: string; name: string; themeId: string };

type Group = { _id: string; name: string; subthemeId: string };

export default function TestForm() {
  const [expandedSubthemes, setExpandedSubthemes] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TestFormData>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      testMode: 'simulado',
      questionMode: [],
      selectedThemes: [],
      selectedSubthemes: [],
      selectedGroups: [],
    },
  });

  // Watch form values for UI updates
  const testMode = watch('testMode');
  const selectedThemes = watch('selectedThemes');
  const selectedSubthemes = watch('selectedSubthemes');
  const selectedGroups = watch('selectedGroups');
  const questionMode = watch('questionMode');

  // Fetch hierarchical data
  const hierarchicalData = useQuery(api.themes.getHierarchicalData);
  const { themes, subthemes, groups } = hierarchicalData ?? {
    themes: [],
    subthemes: [],
    groups: [],
  };

  const onSubmit = (data: TestFormData) => {
    console.log('Form Data:', JSON.stringify(data, undefined, 2));
  };

  const toggleTheme = (themeId: string) => {
    const current = selectedThemes || [];
    setValue(
      'selectedThemes',
      current.includes(themeId)
        ? current.filter(id => id !== themeId)
        : [...current, themeId],
      { shouldValidate: true },
    );
  };

  const toggleQuestionMode = (mode: string, checked: boolean) => {
    const current = questionMode || [];
    setValue(
      'questionMode',
      checked
        ? [...current, mode as TestFormData['questionMode'][number]]
        : current.filter(m => m !== mode),
      { shouldValidate: true },
    );
  };

  const toggleSubtheme = (subthemeId: string) => {
    const current = selectedSubthemes || [];
    setValue(
      'selectedSubthemes',
      current.includes(subthemeId)
        ? current.filter(id => id !== subthemeId)
        : [...current, subthemeId],
      { shouldValidate: true },
    );
  };

  const toggleGroup = (groupId: string) => {
    const current = selectedGroups || [];
    setValue(
      'selectedGroups',
      current.includes(groupId)
        ? current.filter(id => id !== groupId)
        : [...current, groupId],
      { shouldValidate: true },
    );
  };

  const toggleExpandedSubtheme = (subthemeId: string) => {
    setExpandedSubthemes(previous =>
      previous.includes(subthemeId)
        ? previous.filter(id => id !== subthemeId)
        : [...previous, subthemeId],
    );
  };

  const SubthemeItem = ({ subtheme }: { subtheme: Subtheme }) => {
    const subthemeGroups = groups?.filter(g => g.subthemeId === subtheme._id);
    const isSelected = selectedSubthemes.includes(subtheme._id);

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Checkbox
            id={subtheme._id}
            checked={isSelected}
            onCheckedChange={() => toggleSubtheme(subtheme._id)}
          />
          <Label htmlFor={subtheme._id} className="flex-1 truncate text-sm">
            {subtheme.name}
          </Label>
          <button
            onClick={() => toggleExpandedSubtheme(subtheme._id)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {expandedSubthemes.includes(subtheme._id) && (
          <div className="space-y-1 pl-6">
            {subthemeGroups?.map(group => (
              <div key={group._id} className="flex items-center gap-2">
                <Checkbox
                  id={group._id}
                  checked={selectedGroups.includes(group._id)}
                  onCheckedChange={() => toggleGroup(group._id)}
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

  // Simple grouping of subthemes by theme
  const themeSubthemes = themes?.reduce<Record<string, Subtheme[]>>(
    (accumulator, theme) => {
      accumulator[theme._id] =
        subthemes?.filter(s => s.themeId === theme._id) ?? [];
      return accumulator;
    },
    {},
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="mx-auto w-full max-w-3xl">
        <CardContent className="space-y-12 p-4 sm:space-y-14 sm:p-6">
          {/* Avaliação */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-medium">Avaliação</h3>
              <InfoCircle className="text-muted-foreground h-4 w-4" />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={testMode === 'simulado'}
                  onCheckedChange={() =>
                    setValue('testMode', 'simulado', { shouldValidate: true })
                  }
                />
                <Label className="text-sm">Simulado</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={testMode === 'estudo'}
                  onCheckedChange={() =>
                    setValue('testMode', 'estudo', { shouldValidate: true })
                  }
                />
                <Label className="text-sm">Estudo</Label>
              </div>
            </div>
          </div>

          {/* Modo */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-medium">Modo</h3>
              <InfoCircle className="text-muted-foreground h-4 w-4" />
            </div>
            <div
              className="flex flex-wrap gap-4"
              role="group"
              aria-label="Question modes"
            >
              {[
                { id: 'unused', label: 'Unused', count: 3896 },
                { id: 'incorrect', label: 'Incorrect', count: 30 },
                { id: 'marked', label: 'Marked', count: 3 },
                { id: 'all', label: 'All', count: 3928 },
                { id: 'custom', label: 'Custom' },
              ].map(({ id, label, count }) => (
                <div key={id} className="flex items-center gap-2">
                  <Checkbox
                    id={id}
                    checked={questionMode?.includes(
                      id as TestFormData['questionMode'][number],
                    )}
                    onCheckedChange={checked =>
                      toggleQuestionMode(id, checked as boolean)
                    }
                  />
                  <Label htmlFor={id} className="flex items-center gap-2">
                    <span>{label}</span>
                    {count && (
                      <span className="bg-secondary rounded px-1.5 py-0.5 text-xs">
                        {count}
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
            {errors.questionMode && (
              <p className="text-destructive text-sm">
                {errors.questionMode.message}
              </p>
            )}
          </div>

          {/* Themes */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Temas</h3>
            <div className="xs:grid-cols-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {themes?.map(theme => (
                <Button
                  key={theme._id}
                  type="button"
                  onClick={() => toggleTheme(theme._id)}
                  variant={
                    selectedThemes.includes(theme._id) ? 'default' : 'outline'
                  }
                  className="h-auto w-full justify-start py-2 text-left"
                >
                  <span className="truncate text-sm">{theme.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Subtemas */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Subtemas</h3>
            <div className="xs:grid-cols-2 grid grid-cols-1 gap-4">
              {Object.entries(themeSubthemes ?? {}).map(
                ([themeId, subthemes]) =>
                  subthemes.map(subtheme => (
                    <SubthemeItem key={subtheme._id} subtheme={subtheme} />
                  )),
              )}
            </div>
          </div>

          {errors.selectedThemes && (
            <p className="text-destructive text-sm">
              {errors.selectedThemes.message}
            </p>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            Gerar Teste
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
