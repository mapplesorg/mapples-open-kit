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
  /** The list's surface; a swiped row covers its actions with that colour. */
  variant?: ListVariant;
  /** Rows fade out when they leave and slide to their new place. */
  animateChanges?: boolean;
  /**
   * Whether the list itself has been on screen for a frame: a row that
   * mounts after that is a new row and fades in, the first rows do not.
   */
  isSettled?: () => boolean;
}

/** How long a row takes to appear, leave or move in an animated `List`. */
export const LIST_CHANGE_DURATION = '250ms';

export const ListContext = createContext<ListContextValue | null>(null);
