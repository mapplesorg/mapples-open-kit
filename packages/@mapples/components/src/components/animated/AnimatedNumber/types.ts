/** How long a count takes by default, in ms. */
export const ANIMATED_NUMBER_DURATION = 800;

/** Where the value stands `progress` (0–1) of the way: fast first, settling at the end. */
export const animatedNumberAt = (
  from: number,
  to: number,
  progress: number,
): number => {
  const eased = 1 - Math.pow(1 - progress, 3);
  return from + (to - from) * eased;
};

/**
 * The number as text: `decimals` fraction digits, thousands separators with
 * `grouping`, in the device's locale, between `prefix` and `suffix`.
 */
export const formatAnimatedNumber = (
  value: number,
  decimals: number,
  grouping: boolean,
  prefix: string,
  suffix: string,
): string =>
  `${prefix}${new Intl.NumberFormat(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: grouping,
  }).format(value)}${suffix}`;
