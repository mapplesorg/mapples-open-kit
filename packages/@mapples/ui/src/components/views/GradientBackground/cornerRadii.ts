import { ViewStyle } from 'react-native';

const RADIUS_KEYS = [
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderTopStartRadius',
  'borderTopEndRadius',
  'borderBottomStartRadius',
  'borderBottomEndRadius',
] as const satisfies readonly (keyof ViewStyle)[];

/**
 * The corner radii of a host's style for a layer that fills the host inside
 * its border: every radius key the host sets, plus `borderCurve`. A layer
 * inside a border needs the inner radius, so a uniform numeric `borderWidth`
 * is taken off each numeric radius. Returns `null` when the host is square.
 */
export const cornerRadii = (
  host: ViewStyle | null | undefined,
): ViewStyle | null => {
  if (!host) return null;
  const inset = typeof host.borderWidth === 'number' ? host.borderWidth : 0;
  const radii: Record<string, unknown> = {};
  for (const key of RADIUS_KEYS) {
    const value = host[key];
    if (value === undefined || value === null) continue;
    radii[key] = typeof value === 'number' ? Math.max(0, value - inset) : value;
  }
  if (Object.keys(radii).length === 0) return null;
  if (host.borderCurve) radii.borderCurve = host.borderCurve;
  return radii as ViewStyle;
};
