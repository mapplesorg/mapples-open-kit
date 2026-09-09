/** Field surfaces of the search bar. */
export const SEARCH_BAR_VARIANTS = ['filled', 'outlined'] as const;
export type SearchBarVariant = (typeof SEARCH_BAR_VARIANTS)[number];
