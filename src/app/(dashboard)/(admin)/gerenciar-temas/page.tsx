'use client';

import { useMutation, useQuery } from 'convex/react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';
import { useThemeStore } from './store';

export default function GerenciarTemas() {
  const {
    // Selection state
    selectedTheme,
    selectedSubtheme,
    selectedGroup,
    setSelectedTheme,
    setSelectedSubtheme,
    setSelectedGroup,
    // Form state
    newTheme,
    newSubtheme,
    newGroup,
    setNewTheme,
    setNewSubtheme,
    setNewGroup,
    clearNewTheme,
    clearNewSubtheme,
    clearNewGroup,
  } = useThemeStore();

  const hierarchicalData = useQuery(api.themes.getHierarchicalData);
  const createTheme = useMutation(api.themes.create);
  const createSubtheme = useMutation(api.subthemes.create);
  const createGroup = useMutation(api.groups.create);

  if (!hierarchicalData) return <div>Carregando...</div>;

  const { themes, subthemes, groups } = hierarchicalData;

  const filteredSubthemes = selectedTheme
    ? subthemes.filter(subtheme => subtheme.themeId === selectedTheme)
    : [];

  const filteredGroups = selectedSubtheme
    ? groups.filter(group => group.subthemeId === selectedSubtheme)
    : [];

  const handleCreateTheme = async () => {
    if (!newTheme.trim()) return;
    try {
      await createTheme({ name: newTheme });
      clearNewTheme();
    } catch (error) {
      console.error('Failed to create theme:', error);
    }
  };

  const handleCreateSubtheme = async () => {
    if (!newSubtheme.trim() || !selectedTheme) return;
    try {
      await createSubtheme({
        name: newSubtheme,
        themeId: selectedTheme as Id<'themes'>,
      });
      clearNewSubtheme();
    } catch (error) {
      console.error('Failed to create subtheme:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.trim() || !selectedSubtheme) return;
    try {
      await createGroup({
        name: newGroup,
        subthemeId: selectedSubtheme as Id<'subthemes'>,
      });
      clearNewGroup();
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  return (
    <div className="space-y-4 p-6">
      <h1 className="mb-6 text-2xl font-bold">Gerenciar Temas</h1>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="mb-1 block text-sm font-medium">Tema</label>
          <div className="flex gap-2">
            <Select
              value={selectedTheme || undefined}
              onValueChange={setSelectedTheme}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um tema" />
              </SelectTrigger>
              <SelectContent>
                {themes.map(theme => (
                  <SelectItem key={theme._id} value={theme._id}>
                    {theme.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                placeholder="Novo tema"
                value={newTheme}
                onChange={event => setNewTheme(event.target.value)}
                className="w-[200px]"
              />
              <Button onClick={handleCreateTheme} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {selectedTheme && (
          <div className="space-y-2">
            <label className="mb-1 block text-sm font-medium">Subtema</label>
            <div className="flex gap-2">
              <Select
                value={selectedSubtheme || undefined}
                onValueChange={setSelectedSubtheme}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um subtema" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubthemes.map(subtheme => (
                    <SelectItem key={subtheme._id} value={subtheme._id}>
                      {subtheme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  placeholder="Novo subtema"
                  value={newSubtheme}
                  onChange={event => setNewSubtheme(event.target.value)}
                  className="w-[200px]"
                />
                <Button onClick={handleCreateSubtheme} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {selectedSubtheme && (
          <div className="space-y-2">
            <label className="mb-1 block text-sm font-medium">Subgrupo</label>
            <div className="flex gap-2">
              <Select
                value={selectedGroup || undefined}
                onValueChange={setSelectedGroup}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um subgrupo" />
                </SelectTrigger>
                <SelectContent>
                  {filteredGroups.map(group => (
                    <SelectItem key={group._id} value={group._id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  placeholder="Novo subgrupo"
                  value={newGroup}
                  onChange={event => setNewGroup(event.target.value)}
                  className="w-[200px]"
                />
                <Button onClick={handleCreateGroup} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
