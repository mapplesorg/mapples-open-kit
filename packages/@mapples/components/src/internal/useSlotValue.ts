import { useMemo } from 'react';

import { StyledProp, Styler, useSizing, useTheme } from '@mapples/style';

/**
 * Reads one key out of an author style slot (which may be a nested array on
 * the canvas). Returns `undefined` when the slot does not set it.
 */
export const readSlot = <T = unknown>(
  slot: StyledProp<object> | undefined,
  key: string,
): T | undefined => {
  const flat = Styler.flatten(slot as never) as
    | Record<string, unknown>
    | undefined;
  return flat?.[key] as T | undefined;
};

/**
 * The colour a slot sets for `key`, resolved (tokens allowed), or `fallback`
 * — for values that must be concrete in JS (glyph colours, indicators, SVG).
 */
export const useSlotColor = (
  slot: StyledProp<object> | undefined,
  key: string,
  fallback: string,
): string => {
  const { getColor } = useTheme();
  return useMemo(() => {
    const value = readSlot(slot, key);
    return typeof value === 'string' ? getColor(value) : fallback;
  }, [fallback, getColor, key, slot]);
};

/**
 * The number a slot sets for `key`, resolved (`"*2"`, `"sizing.x"` allowed),
 * or `fallback` — for geometry that must be concrete in JS.
 */
export const useSlotSize = (
  slot: StyledProp<object> | undefined,
  key: string,
  fallback: number,
): number => {
  const { getSize } = useSizing();
  return useMemo(() => {
    const value = readSlot(slot, key);
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const resolved = Number(getSize(value));
      return Number.isFinite(resolved) ? resolved : fallback;
    }
    return fallback;
  }, [fallback, getSize, key, slot]);
};
