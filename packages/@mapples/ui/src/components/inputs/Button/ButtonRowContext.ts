import { createContext } from 'react';

/**
 * The main axis of the container that lays a `Button` out, when that
 * container wants `fullWidth` to mean "fill me" (`BottomActionBar`). In a
 * row, stretching across the cross axis changes a button's height, not its
 * width, so a `fullWidth` button there takes the row's remaining width
 * instead. `null` (the default, and what a `ButtonGroup` sets for its own
 * buttons) keeps `fullWidth` as a stretch across the parent.
 *
 * @public
 */
export type ButtonRowContextValue = 'row' | 'column' | null;

/** @public */
export const ButtonRowContext = createContext<ButtonRowContextValue>(null);
