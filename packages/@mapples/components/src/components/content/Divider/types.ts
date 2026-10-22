/** Divider directions. */
export const DIVIDER_ORIENTATIONS = ['horizontal', 'vertical'] as const;
export type DividerOrientation = (typeof DIVIDER_ORIENTATIONS)[number];

/** How the divider line is drawn. */
export const DIVIDER_LINE_STYLES = ['solid', 'dashed', 'dotted'] as const;
export type DividerLineStyle = (typeof DIVIDER_LINE_STYLES)[number];

/** A broken line pattern (everything but `solid`). */
export type DividerDashStyle = Exclude<DividerLineStyle, 'solid'>;

/**
 * Dash and gap lengths of a broken line, in points, for a line `thickness`
 * thick: dashes are four thicknesses long with three-thickness gaps, dots are
 * square, one thickness long with two-thickness gaps.
 */
export const dividerDashArray = (
  lineStyle: DividerDashStyle,
  thickness: number,
): [number, number] =>
  lineStyle === 'dashed'
    ? [Math.max(4, thickness * 4), Math.max(3, thickness * 3)]
    : [thickness, thickness * 2];
