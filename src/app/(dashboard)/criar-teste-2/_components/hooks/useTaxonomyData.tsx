import { useQuery } from 'convex/react';
import { useMemo } from 'react';

import { api } from '../../../../../../convex/_generated/api';
import { Id } from '../../../../../../convex/_generated/dataModel';

export interface TaxonomyItem {
  _id: Id<'taxonomy'>;
  _creationTime: number;
  name: string;
  type: 'theme' | 'subtheme' | 'group';
  parentId?: Id<'taxonomy'>;
  pathIds?: Id<'taxonomy'>[];
  pathNames?: string[];
}

export interface TaxonomyHierarchy {
  themes: TaxonomyItem[];
  subthemes: TaxonomyItem[];
  groups: TaxonomyItem[];
}

export function useTaxonomyData() {
  // Fetch all taxonomy data
  const themes = useQuery(api.taxonomyAggregates.getTaxonomyByType, {
    type: 'theme',
  });
  const subthemes = useQuery(api.taxonomyAggregates.getTaxonomyByType, {
    type: 'subtheme',
  });
  const groups = useQuery(api.taxonomyAggregates.getTaxonomyByType, {
    type: 'group',
  });

  // Create hierarchical structure
  const hierarchicalData = useMemo((): TaxonomyHierarchy | undefined => {
    if (!themes || !subthemes || !groups) return undefined;

    return {
      themes: themes.sort((a, b) => a.name.localeCompare(b.name)),
      subthemes: subthemes.sort((a, b) => a.name.localeCompare(b.name)),
      groups: groups.sort((a, b) => a.name.localeCompare(b.name)),
    };
  }, [themes, subthemes, groups]);

  // Helper functions
  const getSubthemesForTheme = (themeId: Id<'taxonomy'>): TaxonomyItem[] => {
    if (!hierarchicalData) return [];
    return hierarchicalData.subthemes.filter(
      sub => sub.pathIds && sub.pathIds.includes(themeId),
    );
  };

  const getGroupsForSubtheme = (subthemeId: Id<'taxonomy'>): TaxonomyItem[] => {
    if (!hierarchicalData) return [];
    return hierarchicalData.groups.filter(
      group => group.pathIds && group.pathIds.includes(subthemeId),
    );
  };

  const getGroupsForTheme = (themeId: Id<'taxonomy'>): TaxonomyItem[] => {
    if (!hierarchicalData) return [];
    return hierarchicalData.groups.filter(
      group => group.pathIds && group.pathIds.includes(themeId),
    );
  };

  // Note: These would need to be called as separate hooks in components
  // const getTaxonomyHierarchy = (taxonomyId: Id<'taxonomy'>) => {
  //   return useQuery(api.taxonomyAggregates.getTaxonomyHierarchy, { taxonomyId });
  // };

  // const getDescendants = (taxonomyId: Id<'taxonomy'>) => {
  //   return useQuery(api.taxonomyAggregates.getTaxonomyDescendants, { taxonomyId });
  // };

  return {
    hierarchicalData,
    themes,
    subthemes,
    groups,
    getSubthemesForTheme,
    getGroupsForSubtheme,
    getGroupsForTheme,
    isLoading: !themes || !subthemes || !groups,
  };
}
