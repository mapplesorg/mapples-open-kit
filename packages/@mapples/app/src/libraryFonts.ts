import { FONT_FILES } from '@mapples/fonts';
import { StyleContextType } from '@mapples/style';
import { Platform } from 'react-native';

/** The font families a style config's typography names: its default font and every text style's. */
export const typographyFamilies = (style: StyleContextType): Set<string> => {
  const { typographyConfig } = style;
  const families = new Set<string>([typographyConfig.fontFamily]);
  for (const textStyle of Object.values(typographyConfig.typography)) {
    if (typeof textStyle.fontFamily === 'string') families.add(textStyle.fontFamily);
  }
  return families;
};

/**
 * The library fonts (`@mapples/fonts`) to load before the first render, and
 * the ones to declare lazily. On native every face loads up front: the files
 * are bundled, and text laid out before its face loads keeps the fallback.
 * On web only the faces the typography names are awaited; the other ~80 are
 * declared without being fetched, and the browser downloads one only when
 * some text uses it (a `fontFamily` written in a component's style).
 */
export const splitLibraryFonts = (
  style: StyleContextType,
): { awaited: Record<string, number>; lazy: Record<string, number> } => {
  if (Platform.OS !== 'web') return { awaited: FONT_FILES, lazy: {} };
  const used = typographyFamilies(style);
  const awaited: Record<string, number> = {};
  const lazy: Record<string, number> = {};
  for (const [family, source] of Object.entries(FONT_FILES)) {
    (used.has(family) ? awaited : lazy)[family] = source;
  }
  return { awaited, lazy };
};
