import { AnyObject } from '@mapples/render';
import type { DeepPartial, StyleContextType } from '@mapples/style';
import { keys, reduce } from 'lodash';

/**
 * Normalizes a reference key by extracting type, id, and name information.
 *
 * This function parses reference keys in the format `ref(type:id:name)` and extracts
 * the individual components. It's used internally for processing asset references.
 *
 * @param key - The reference key to normalize, either in `ref(type:id:name)` format or a plain string
 * @returns An object containing the parsed type, id, and normalized name, or undefined if the key format is invalid
 *
 * @example
 * ```typescript
 * const result = normalizeKey('ref(font:123:MyFont.ttf)');
 * // Returns: { type: 'font', id: '123', name: 'MyFont' }
 * ```
 *
 * @example
 * ```typescript
 * const result = normalizeKey('plain-string');
 * // Returns: undefined (invalid format)
 * ```
 */
export const normalizeKey = (
  key: `ref(${string}:${string}:${string})` | string,
) => {
  let normalizedKey: string = key;
  if (!key.startsWith('ref(') || !key.endsWith(')')) {
    return;
  }

  const cleanValue = key.slice(4, -1);

  const [type, id, name] = cleanValue.split(':');
  const [fileName] = name.split('.');

  normalizedKey = fileName;

  return {
    type,
    id,
    name: normalizedKey,
  };
};

/**
 * Remaps font assets from the Mapples asset configuration format to a format compatible with expo-font.
 *
 * This function processes the assets object and extracts only font-type assets, converting them
 * from the Mapples reference format to a simple key-value mapping that expo-font can use.
 *
 * @param assets - The assets configuration object containing font references
 * @returns A new object containing only the font assets in expo-font compatible format
 *
 * @example
 * ```typescript
 * const assets = {
 *   'ref(font:123:MyFont.ttf)': require('./fonts/MyFont.ttf'),
 *   'ref(image:456:logo.png)': require('./images/logo.png'),
 * };
 *
 * const fonts = remapFonts(assets);
 * // Returns: { MyFont: require('./fonts/MyFont.ttf') }
 * ```
 */
export const remapFonts = (assets: AnyObject) => {
  return reduce(
    keys(assets),
    (acc, key) => {
      const normalizedKey = normalizeKey(key);
      if (!normalizedKey) {
        return acc;
      }

      const { type, name } = normalizedKey;

      if (type !== 'font') {
        return acc;
      }

      return {
        ...acc,
        [name]: assets[key],
      };
    },
    {},
  );
};

/**
 * The module `mapples sync` writes as `<mapplesDir>/theme.ts`: one exported
 * document per token section. Each is the canvas singleton's `data`.
 */
export interface CliThemeModule {
  theme?: DeepPartial<StyleContextType>['themeConfig'];
  typography?: DeepPartial<StyleContextType>['typographyConfig'];
  sizing?: DeepPartial<StyleContextType>['sizingConfig'];
}

/**
 * Maps the CLI's `theme.ts` onto the style configuration `Styler.init`
 * merges with the defaults (responsive breakpoints included).
 */
export const toStyleContext = (
  mod: CliThemeModule | undefined,
): DeepPartial<StyleContextType> => ({
  themeConfig: mod?.theme,
  typographyConfig: mod?.typography,
  sizingConfig: mod?.sizing,
});

/**
 * One entry of the CLI's `<mapplesDir>/assetMap.ts`, keyed by the canvas `as_…`
 * id. `source` is the bundled file; the rest is the asset record's
 * metadata (`mapples` ≥ the assetMap-metadata release). Older maps hold the
 * bare `require` as the value.
 */
export interface CliAssetEntry {
  source: unknown;
  type?: string;
  /** File name without extension — the family name a font registers under. */
  name?: string;
  /** Local file name with extension — the third segment of a `ref(...)`. */
  file?: string;
  uuid?: string;
  mime?: string;
}

/** The module `mapples sync` writes as `<mapplesDir>/assetMap.ts`. */
export interface CliAssetModule {
  assetMap?: Record<string, CliAssetEntry | unknown>;
  default?: Record<string, CliAssetEntry | unknown>;
}

const isCliEntry = (value: unknown): value is CliAssetEntry =>
  typeof value === 'object' && value !== null && 'source' in value;

/**
 * Resolves what an app renders assets from: the renderer looks a node's
 * `ref(type:uuid:file)` up in `assets`, expo-font registers `fonts`.
 *
 * Accepts either the CLI's `assetMap.ts` module (keys `as_…`, values with
 * metadata) or a map already keyed by `ref(...)` — the `assets` prop of
 * `MapplesApp`, or a map generated before the metadata release. A CLI entry
 * without `uuid`/`file` still registers its font by `name`; it just cannot
 * be addressed by a `ref(...)`.
 */
export const resolveAssets = (
  input: CliAssetModule | AnyObject | undefined,
): { assets: AnyObject; fonts: AnyObject } => {
  const raw =
    (input as CliAssetModule | undefined)?.assetMap ??
    (input as CliAssetModule | undefined)?.default ??
    (input as AnyObject | undefined) ??
    {};
  const assets: AnyObject = {};
  const fonts: AnyObject = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!isCliEntry(value)) {
      // a ref(...)-keyed map: as given
      assets[key] = value;
      continue;
    }
    if (value.uuid && value.file) {
      assets[`ref(${value.type ?? 'file'}:${value.uuid}:${value.file})`] =
        value.source;
    }
    if (value.type === 'font' && value.name) {
      fonts[value.name] = value.source;
    }
  }
  return { assets, fonts: { ...remapFonts(assets), ...fonts } };
};
