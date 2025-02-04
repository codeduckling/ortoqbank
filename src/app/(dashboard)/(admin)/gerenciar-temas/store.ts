import { create } from 'zustand';

interface ThemeState {
  // Selection state
  selectedTheme: string | undefined;
  selectedSubtheme: string | undefined;
  selectedGroup: string | undefined;

  // Form state
  newTheme: string;
  newSubtheme: string;
  newGroup: string;

  // Selection actions
  setSelectedTheme: (themeId: string | undefined) => void;
  setSelectedSubtheme: (subthemeId: string | undefined) => void;
  setSelectedGroup: (groupId: string | undefined) => void;

  // Form actions
  setNewTheme: (name: string) => void;
  setNewSubtheme: (name: string) => void;
  setNewGroup: (name: string) => void;
  clearNewTheme: () => void;
  clearNewSubtheme: () => void;
  clearNewGroup: () => void;

  reset: () => void;
}

export const useThemeStore = create<ThemeState>(set => ({
  // Selection state
  selectedTheme: undefined,
  selectedSubtheme: undefined,
  selectedGroup: undefined,

  // Form state
  newTheme: '',
  newSubtheme: '',
  newGroup: '',

  // Selection actions
  setSelectedTheme: themeId =>
    set({
      selectedTheme: themeId,
      selectedSubtheme: undefined,
      selectedGroup: undefined,
    }),

  setSelectedSubtheme: subthemeId =>
    set({
      selectedSubtheme: subthemeId,
      selectedGroup: undefined,
    }),

  setSelectedGroup: groupId =>
    set({
      selectedGroup: groupId,
    }),

  // Form actions
  setNewTheme: name => set({ newTheme: name }),
  setNewSubtheme: name => set({ newSubtheme: name }),
  setNewGroup: name => set({ newGroup: name }),

  clearNewTheme: () => set({ newTheme: '' }),
  clearNewSubtheme: () => set({ newSubtheme: '' }),
  clearNewGroup: () => set({ newGroup: '' }),

  reset: () =>
    set({
      selectedTheme: undefined,
      selectedSubtheme: undefined,
      selectedGroup: undefined,
      newTheme: '',
      newSubtheme: '',
      newGroup: '',
    }),
}));
