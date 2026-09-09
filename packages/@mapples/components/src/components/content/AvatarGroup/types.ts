import { ImageProps } from 'expo-image';

/** One member of an {@link AvatarGroup}. */
export interface AvatarGroupItem {
  /** Photo source (a uri string or an expo-image source). */
  source?: ImageProps['source'];
  /** Display name; its initials show when there is no photo. */
  name?: string;
}

/** Ring drawn around each avatar so overlapping edges stay readable. */
export const AVATAR_GROUP_RING = 2;

/**
 * The members a group renders. A malformed entry is a data error — it is
 * reported, never silently skipped, so an author sees which item is wrong.
 */
export const readAvatarGroupItems = (
  items: unknown,
  component: string,
): AvatarGroupItem[] => {
  if (items === undefined || items === null) return [];
  if (!Array.isArray(items)) {
    throw new Error(`${component}: items must be an array of {source?, name?}`);
  }
  items.forEach((item, index) => {
    if (typeof item !== 'object' || item === null) {
      throw new Error(
        `${component}: items[${index}] must be an object {source?, name?}`,
      );
    }
    const { name } = item as AvatarGroupItem;
    if (name !== undefined && typeof name !== 'string') {
      throw new Error(`${component}: items[${index}].name must be a string`);
    }
  });
  return items as AvatarGroupItem[];
};
