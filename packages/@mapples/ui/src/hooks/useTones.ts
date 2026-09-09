import { useCallback, useMemo } from 'react';

import { useTheme, withAlpha } from '@mapples/style';

import { STATE_LAYER_OPACITY, Tokens, Tone } from '../tokens';

/** The resolved colours of one tone (see {@link Tone}). */
export interface TonePalette {
  /** The tone's main colour — fills and emphasised text. */
  main: string;
  /** Text/glyph colour on a `main` fill. */
  contrast: string;
  /** A soft tinted surface of the tone. */
  container: string;
  /** Text/glyph colour on `container`. */
  onContainer: string;
}

/** Resolved colours every themed component shares. */
export interface Tones {
  /** Whether the active palette is the dark one. */
  isDark: boolean;
  /** Hairline outline of controls and cards. */
  outline: string;
  /** Emphasised outline (outlined buttons, focused fields). */
  outlineStrong: string;
  /** Soft fill of tracks, skeletons and inactive segments. */
  fill: string;
  /** Stronger fill (hovered rows, chip surfaces). */
  fillStrong: string;
  /** Divider lines. */
  divider: string;
  /** Overlay scrim. */
  backdrop: string;
  /** Placeholder text. */
  placeholder: string;
  /** A state layer of `color` at the hover or pressed alpha. */
  stateLayer: (
    color: string,
    level: keyof typeof STATE_LAYER_OPACITY,
  ) => string;
  /** The palette of a tone. */
  tone: (tone: Tone) => TonePalette;
  /** Resolves a theme token (or passes a literal colour through). */
  resolve: (token: string) => string;
}

/**
 * Resolves the neutral and tonal colours the themed components are built
 * from. Neutrals derive from the text colour at an alpha, so they read
 * correctly on light and dark surfaces alike — the palette's `neutral` scale
 * is not inverted for dark themes and must not be used for them.
 *
 * @example
 * ```tsx
 * const tones = useTones();
 * <View style={{ borderColor: tones.outline }} />
 * ```
 *
 * @public
 */
const useTones = (): Tones => {
  const { getColor, themeConfig, colorScheme } = useTheme();

  const isDark =
    themeConfig.variant === 'auto'
      ? colorScheme === 'dark'
      : themeConfig.variant === 'dark';

  const resolve = useCallback((token: string) => getColor(token), [getColor]);

  const stateLayer = useCallback(
    (color: string, level: keyof typeof STATE_LAYER_OPACITY) =>
      withAlpha(color, STATE_LAYER_OPACITY[level]),
    [],
  );

  const tone = useCallback(
    (key: Tone): TonePalette => {
      const text = getColor(Tokens.color.text);
      switch (key) {
        case 'primary':
          return {
            main: getColor(Tokens.color.primary),
            contrast: getColor(Tokens.color.onPrimary),
            container: getColor(Tokens.color.primaryContainer),
            onContainer: text,
          };
        case 'accent':
          return {
            main: getColor(Tokens.color.accent),
            contrast: getColor(Tokens.color.onAccent),
            container: getColor(Tokens.color.accentContainer),
            onContainer: text,
          };
        case 'neutral':
          return {
            main: text,
            contrast: getColor(Tokens.color.background),
            container: withAlpha(text, 0.08),
            onContainer: text,
          };
        default: {
          const main = getColor(Tokens.color[key]);
          return {
            main,
            contrast: getColor(Tokens.color.white),
            container: withAlpha(main, 0.14),
            onContainer: text,
          };
        }
      }
    },
    [getColor],
  );

  return useMemo(() => {
    const text = getColor(Tokens.color.text);
    const inverse = getColor(Tokens.color.inverse);
    return {
      isDark,
      outline: withAlpha(text, 0.14),
      outlineStrong: withAlpha(text, 0.28),
      fill: withAlpha(text, 0.06),
      fillStrong: withAlpha(text, 0.1),
      divider: withAlpha(text, 0.12),
      backdrop: withAlpha(inverse, 0.4),
      placeholder: getColor(Tokens.color.textTertiary),
      stateLayer,
      tone,
      resolve,
    };
  }, [getColor, isDark, resolve, stateLayer, tone]);
};

export default useTones;
