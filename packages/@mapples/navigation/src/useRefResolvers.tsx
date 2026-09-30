import { createElement } from 'react';

import { useRender } from '@mapples/render';
import { ThemeMap, useTheme } from '@mapples/style';
import { parseGlyphRef } from '@mapples/types';
import { Image, ImageSourcePropType } from 'react-native';

import { parseRef } from './refs';
import { IconRenderer, RefResolvers } from './types';

/** Resolve a dot-path (e.g. `primary.main`) against the active theme map. */
const lookupToken = (map: ThemeMap, path: string): string | undefined => {
  let current: ThemeMap[string] | undefined = map;
  for (const key of path.split('.')) {
    if (current == null || typeof current === 'string') return undefined;
    current = current[key];
  }
  return typeof current === 'string' ? current : undefined;
};

/**
 * Builds {@link RefResolvers} from the host's style + render contexts:
 * `ref(theme:…)` resolves against `@mapples/style`'s active theme, `ref(icon:…)`
 * against `@mapples/render`'s assets map, and `ref(glyph:<family>:<name>)`
 * through the host's registered `Icon` component (the font-glyph element an
 * `Icon` node renders). Unresolvable theme / asset refs warn and fall back to
 * a default rather than crashing; a glyph ref on a host without an `Icon`
 * component is a wiring error and throws.
 */
const useRefResolvers = (): RefResolvers => {
  const { theme, themeConfig } = useTheme();
  const { assets, components } = useRender();

  const resolveColor = (value?: string): string | undefined => {
    if (!value) return undefined;

    const parsed = parseRef(value);
    if (!parsed) return value; // already a concrete colour value
    if (parsed.type !== 'theme') return undefined;

    const resolved = lookupToken(theme, parsed.name);
    if (resolved) return resolved;

    console.warn(`[@mapples/navigation] unresolved theme ref: ${value}`);
    return themeConfig.defaultColor;
  };

  const resolveIcon = (value?: string): IconRenderer | undefined => {
    if (!value) return undefined;

    const glyph = parseGlyphRef(value);
    if (glyph) {
      const GlyphIcon = components.Icon?.Component;
      if (!GlyphIcon) {
        throw new Error(
          `[@mapples/navigation] ${value} needs an "Icon" component registered with the RenderProvider`,
        );
      }
      // eslint-disable-next-line react/display-name
      return ({ size, color }) =>
        createElement(GlyphIcon, {
          iconStyle: glyph.family,
          iconName: glyph.name,
          size: size ?? 24,
          color,
        } as object);
    }

    const parsed = parseRef(value);
    if (!parsed || parsed.type !== 'icon') return undefined;

    const asset: unknown = assets[value];
    if (asset == null) {
      console.warn(`[@mapples/navigation] unresolved icon ref: ${value}`);
      return undefined;
    }

    const source: ImageSourcePropType =
      typeof asset === 'string'
        ? { uri: asset }
        : (asset as ImageSourcePropType);

    // The returned value is a React Navigation icon option callback, not a
    // component, so it needs no display name.
    // eslint-disable-next-line react/display-name
    return ({ size }) =>
      createElement(Image, {
        source,
        style: { width: size ?? 24, height: size ?? 24 },
      });
  };

  return { resolveColor, resolveIcon };
};

export default useRefResolvers;
