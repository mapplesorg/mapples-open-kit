/**
 * The closed font set. Families and weights here are the only values the
 * typography generator may emit, and every entry has a file under assets/.
 * Keep this file runtime-free (the AI service imports it in Node).
 */

export const FONT_FAMILIES = [
  'Inter',
  'Manrope',
  'DM Sans',
  'Plus Jakarta Sans',
  'Poppins',
  'Nunito',
  'Space Grotesk',
  'Sora',
  'Outfit',
  'Playfair Display',
  'Fraunces',
  'IBM Plex Mono',
  'Inter Tight',
  'Nunito Sans',
  'Jost',
  'Lexend',
  'Archivo',
  'Bricolage Grotesque',
  'Syne',
  'Instrument Serif',
  'Cormorant Garamond',
] as const;

export type FontFamily = (typeof FONT_FAMILIES)[number];

export const FONT_WEIGHTS = ['Regular', 'Medium', 'SemiBold', 'Bold'] as const;
export type FontWeight = (typeof FONT_WEIGHTS)[number];

export type FontCategory = 'sans' | 'serif' | 'mono';

export interface FontMeta {
  category: FontCategory;
  /** Weights shipped for this family. */
  weights: readonly FontWeight[];
  /** One-line character note the generator can use to pair fonts. */
  character: string;
  /** Families that pair well as headline/body partners. */
  pairsWith: readonly FontFamily[];
}

export const FONT_META: Record<FontFamily, FontMeta> = {
  Inter: {
    category: 'sans',
    weights: FONT_WEIGHTS,
    character: 'neutral, highly legible UI sans',
    pairsWith: ['Playfair Display', 'Fraunces', 'IBM Plex Mono'],
  },
  Manrope: {
    category: 'sans',
    weights: FONT_WEIGHTS,
    character: 'modern geometric, friendly tech',
    pairsWith: ['Fraunces', 'Inter', 'IBM Plex Mono'],
  },
  'DM Sans': {
    category: 'sans',
    weights: FONT_WEIGHTS,
    character: 'low-contrast geometric, calm product UI',
    pairsWith: ['Playfair Display', 'Fraunces'],
  },
  'Plus Jakarta Sans': {
    category: 'sans',
    weights: FONT_WEIGHTS,
    character: 'rounded geometric, startup/fintech',
    pairsWith: ['Inter', 'Fraunces'],
  },
  Poppins: {
    category: 'sans',
    weights: FONT_WEIGHTS,
    character: 'round geometric, playful consumer apps',
    pairsWith: ['Nunito', 'Inter'],
  },
  Nunito: {
    category: 'sans',
    weights: FONT_WEIGHTS,
    character: 'soft rounded terminals, approachable',
    pairsWith: ['Poppins', 'Outfit'],
  },
  'Space Grotesk': {
    category: 'sans',
    weights: FONT_WEIGHTS,
    character: 'quirky technical grotesk, dev tools',
    pairsWith: ['Inter', 'IBM Plex Mono'],
  },
  Sora: {
    category: 'sans',
    weights: FONT_WEIGHTS,
    character: 'wide geometric display sans, bold headlines',
    pairsWith: ['Inter', 'DM Sans'],
  },
  Outfit: {
    category: 'sans',
    weights: FONT_WEIGHTS,
    character: 'clean geometric display, fashion/lifestyle',
    pairsWith: ['DM Sans', 'Nunito'],
  },
  'Playfair Display': {
    category: 'serif',
    weights: ['Regular', 'SemiBold', 'Bold'],
    character: 'high-contrast editorial serif for headlines',
    pairsWith: ['Inter', 'DM Sans'],
  },
  Fraunces: {
    category: 'serif',
    weights: ['Regular', 'SemiBold', 'Bold'],
    character: 'soft wonky serif, warm and characterful',
    pairsWith: ['Manrope', 'Inter', 'DM Sans'],
  },
  'IBM Plex Mono': {
    category: 'mono',
    weights: ['Regular', 'Medium'],
    character: 'monospace for code, data and labels',
    pairsWith: ['Inter', 'Space Grotesk'],
  },
  'Inter Tight': {
    category: 'sans',
    weights: FONT_WEIGHTS,
    character: 'tightly spaced Inter for compact editorial UI',
    pairsWith: ['Instrument Serif', 'Playfair Display', 'IBM Plex Mono'],
  },
  'Nunito Sans': {
    category: 'sans',
    weights: FONT_WEIGHTS,
    character: 'gentle humanist sans, calm wellness apps',
    pairsWith: ['Fraunces', 'Playfair Display'],
  },
  Jost: {
    category: 'sans',
    weights: FONT_WEIGHTS,
    character: 'Futura-like geometric, refined and airy',
    pairsWith: ['Cormorant Garamond', 'Playfair Display'],
  },
  Lexend: {
    category: 'sans',
    weights: FONT_WEIGHTS,
    character: 'wide, highly readable sans, bold and blunt',
    pairsWith: ['IBM Plex Mono', 'Inter'],
  },
  Archivo: {
    category: 'sans',
    weights: FONT_WEIGHTS,
    character: 'sturdy grotesk, monochrome fashion and retail',
    pairsWith: ['IBM Plex Mono', 'Inter'],
  },
  'Bricolage Grotesque': {
    category: 'sans',
    weights: FONT_WEIGHTS,
    character: 'expressive ink-trap grotesk, warm consumer brands',
    pairsWith: ['DM Sans', 'Inter'],
  },
  Syne: {
    category: 'sans',
    weights: FONT_WEIGHTS,
    character: 'eccentric wide display sans, events and culture',
    pairsWith: ['Inter', 'DM Sans'],
  },
  'Instrument Serif': {
    category: 'serif',
    weights: ['Regular'],
    character: 'condensed editorial display serif, headlines only',
    pairsWith: ['Inter Tight', 'Inter', 'DM Sans'],
  },
  'Cormorant Garamond': {
    category: 'serif',
    weights: FONT_WEIGHTS,
    character: 'high-contrast Garamond, luxury and real estate',
    pairsWith: ['Jost', 'Inter', 'Manrope'],
  },
};

/** The registered React Native family name for a family + weight. */
export const fontFamilyName = (
  family: FontFamily,
  weight: FontWeight,
): string => `${family.replace(/\s+/g, '')}-${weight}`;

/** Relative path of each font file from the package root. */
export const FONT_FILE_PATHS: Record<string, string> = Object.fromEntries(
  FONT_FAMILIES.flatMap((family) =>
    FONT_META[family].weights.map((weight) => {
      const name = fontFamilyName(family, weight);
      return [name, `assets/${family.replace(/\s+/g, '')}/${name}.ttf`];
    }),
  ),
);

/** Every registered family name, e.g. "Inter-SemiBold". */
export const FONT_NAMES: string[] = Object.keys(FONT_FILE_PATHS);

export const isBuiltinFontName = (name: string): boolean =>
  name in FONT_FILE_PATHS;
