import { createContext } from 'react';

/** List surfaces. */
export const LIST_VARIANTS = ['plain', 'inset', 'card'] as const;
export type ListVariant = (typeof LIST_VARIANTS)[number];

/** What a `List` tells the `ListItem` rows inside it. */
export interface ListContextValue {
  /** Rows draw a bottom divider. */
  dividers: boolean;
  /** Divider start inset in points. */
  dividerInset: number;
}

export const ListContext = createContext<ListContextValue | null>(null);
