import { AnyObject } from '@mapples/render';
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
