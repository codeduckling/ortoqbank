import { useMutation, useQuery } from 'convex/react';
import { create } from 'zustand';

import { api } from '../../../../../../../convex/_generated/api';
import { Id } from '../../../../../../../convex/_generated/dataModel';

interface Theme {
  _id: Id<'themes'>;
  name: string;
  subthemeCount: number;
}

interface ThemeStore {
  editingTheme: Theme | undefined;
  isDialogOpen: boolean;
  isSubthemeDialogOpen: boolean;
  activeThemeId: Id<'themes'> | null;
  setEditingTheme: (theme: Theme | undefined) => void;
  setDialogOpen: (open: boolean) => void;
  setSubthemeDialogOpen: (open: boolean) => void;
  setActiveThemeId: (id: Id<'themes'> | null) => void;
}

export const useThemeStore = create<ThemeStore>(set => ({
  editingTheme: undefined,
  isDialogOpen: false,
  isSubthemeDialogOpen: false,
  activeThemeId: null,
  setEditingTheme: theme => set({ editingTheme: theme }),
  setDialogOpen: open => set({ isDialogOpen: open }),
  setSubthemeDialogOpen: open => set({ isSubthemeDialogOpen: open }),
  setActiveThemeId: id => set({ activeThemeId: id }),
}));

// Custom hooks for data operations
export function useThemes() {
  return useQuery(api.themes.list) ?? [];
}

export function useSubthemes(themeId: Id<'themes'> | null) {
  return (
    useQuery(api.themes.getWithSubthemes, themeId ? { themeId } : 'skip')
      ?.subthemes ?? []
  );
}

export function useThemeActions() {
  const createTheme = useMutation(api.themes.create);
  const createSubtheme = useMutation(api.themes.createSubtheme);
  const store = useThemeStore();

  return {
    addTheme: async (name: string) => {
      if (!name.trim()) return;
      await createTheme({ name: name.trim() });
      store.setDialogOpen(false);
    },
    addSubtheme: async (themeId: Id<'themes'>, name: string) => {
      if (!name.trim()) return;
      await createSubtheme({ themeId, name: name.trim() });
      store.setSubthemeDialogOpen(false);
    },
    updateTheme: async (id: Id<'themes'>, name: string) => {
      // TODO: Implement
      console.log('Update theme:', { id, name });
      store.setEditingTheme(undefined);
      store.setDialogOpen(false);
    },
    deleteTheme: async (id: Id<'themes'>) => {
      // TODO: Implement
      console.log('Delete theme:', id);
    },
  };
}
