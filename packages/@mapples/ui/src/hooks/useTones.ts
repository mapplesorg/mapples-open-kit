import { useCallback, useMemo } from 'react';

import { contrastRatio, useTheme, withAlpha } from '@mapples/style';

import { STATE_LAYER_OPACITY, Tokens, Tone } from '../tokens';

/** The resolved colours of one tone (see {@link Tone}). */
export interface TonePalette {
  /** The tone's main colour — fills, tracks and indicators. */
  main: string;
  /**
   * The tone as text, glyphs and lines on the page surface: `main` when it
   * reads at {@link INK_CONTRAST}:1 against the card surface, else whichever
   * of the tone's `dark`/`light` shades reads better. A fill-only brand
   * colour (a lime, a pale yellow) stays legible this way.
   */
  ink: string;
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
/** Minimum contrast of a tone's `ink` against the card surface (WCAG AA text). */
export const INK_CONTRAST = 4.5;

/** The first shade that reaches {@link INK_CONTRAST} on `surface`, else the strongest. */
const pickInk = (surface: string, shades: string[]): string => {
  const readable = shades.find(
    (shade) => contrastRatio(shade, surface) >= INK_CONTRAST,
  );
  if (readable) return readable;
  return shades.reduce((best, shade) =>
    contrastRatio(shade, surface) > contrastRatio(best, surface) ? shade : best,
  );
};

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
      const surface = getColor(Tokens.color.surface);
      switch (key) {
        case 'primary': {
          const main = getColor(Tokens.color.primary);
          return {
            main,
            ink: pickInk(surface, [
              main,
              getColor(Tokens.color.primaryDark),
              getColor(Tokens.color.primaryLight),
            ]),
            contrast: getColor(Tokens.color.onPrimary),
            container: getColor(Tokens.color.primaryContainer),
            onContainer: text,
          };
        }
        case 'accent': {
          const main = getColor(Tokens.color.accent);
          return {
            main,
            ink: pickInk(surface, [
              main,
              getColor(Tokens.color.accentDark),
              getColor(Tokens.color.accentLight),
            ]),
            contrast: getColor(Tokens.color.onAccent),
            container: getColor(Tokens.color.accentContainer),
            onContainer: text,
          };
        }
        case 'neutral':
          return {
            main: text,
            ink: text,
            contrast: getColor(Tokens.color.background),
            container: withAlpha(text, 0.08),
            onContainer: text,
          };
        default: {
          const main = getColor(Tokens.color[key]);
          return {
            main,
            ink: main,
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
