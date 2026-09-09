/** Avatar sizes. */
export const AVATAR_SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
export type AvatarSize = (typeof AVATAR_SIZES)[number];

/** Avatar shapes. */
export const AVATAR_SHAPES = ['circle', 'rounded', 'square'] as const;
export type AvatarShape = (typeof AVATAR_SHAPES)[number];

/** Presence states shown as a dot. */
export const AVATAR_STATUSES = ['none', 'online', 'offline', 'busy'] as const;
export type AvatarStatus = (typeof AVATAR_STATUSES)[number];

/** Edge per size. */
export const AVATAR_EDGE: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

/** Two-letter initials of a display name. */
export const initialsOf = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  const first = words[0][0] ?? '';
  const last = words.length > 1 ? (words[words.length - 1][0] ?? '') : '';
  return `${first}${last}`.toUpperCase();
};
