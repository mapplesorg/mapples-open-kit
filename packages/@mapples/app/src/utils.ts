import { AnyObject } from '@mapples/render';
import { keys, reduce } from 'lodash';

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
