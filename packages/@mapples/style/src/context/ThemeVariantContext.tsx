import { createContext, useContext } from 'react';

import { ThemeConfig } from '../types';

/** A theme variant chosen while the app runs: `light`, `dark` or `auto`. */
export type ThemeVariant = ThemeConfig['variant'];

/** The runtime theme choice, over the project's `themeConfig.variant`. */
export interface ThemeVariantContextType {
  /** The chosen variant, or `null` to follow the project's configuration. */
  variant: ThemeVariant | null;
  setVariant: (variant: ThemeVariant | null) => void;
}

/**
 * Holds the variant an app switches to at runtime (a Light / Dark / Auto
 * setting). Defaults to `null`: without a `ThemeVariantProvider` the theme
 * follows `themeConfig.variant` as configured.
 */
const ThemeVariantContext = createContext<ThemeVariantContextType | null>(null);

export const ThemeVariantContextProvider = ThemeVariantContext.Provider;

/** The runtime theme choice, or `null` when no provider is mounted. */
export const useThemeVariant = (): ThemeVariantContextType | null =>
  useContext(ThemeVariantContext);

export default ThemeVariantContext;
