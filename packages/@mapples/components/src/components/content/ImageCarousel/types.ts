/** Page indicator styles of an `ImageCarousel`. */
export const IMAGE_CAROUSEL_INDICATOR_VARIANTS = [
  'dots',
  'bars',
  'counter',
] as const;
export type ImageCarouselIndicatorVariant =
  (typeof IMAGE_CAROUSEL_INDICATOR_VARIANTS)[number];

/**
 * Where the page indicator sits: in a row `below` the slides (the default)
 * or over them at the bottom centre, bottom end or top end.
 */
export const IMAGE_CAROUSEL_INDICATOR_POSITIONS = [
  'below',
  'bottom-center',
  'bottom-end',
  'top-end',
] as const;
export type ImageCarouselIndicatorPosition =
  (typeof IMAGE_CAROUSEL_INDICATOR_POSITIONS)[number];

/** Throws when `value` is not one of `allowed` — an authoring error. */
export const assertImageCarouselEnum = <T extends string>(
  prop: string,
  value: unknown,
  allowed: readonly T[],
): T => {
  if (!allowed.includes(value as T)) {
    throw new Error(
      `ImageCarousel: ${prop} must be one of ${allowed.join(', ')} (got ${String(value)})`,
    );
  }
  return value as T;
};
