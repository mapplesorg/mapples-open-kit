import type { GradientStop } from '@mapples/types';

/** One wedge of a conic gradient: an SVG path and its colour. */
export interface ConicWedge {
  path: string;
  color: string;
  opacity: number;
}

/** How many wedges a full sweep is drawn with: 3° each, smooth to the eye. */
export const CONIC_WEDGES = 120;

type Rgba = [number, number, number, number];

const HEX = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB =
  /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i;

/**
 * A stop colour as red, green, blue (0–255) and alpha (0–1). Stop colours
 * are literals (`#rgb`, `#rrggbb`, with alpha, `rgb()`, `rgba()`,
 * `transparent`); anything else throws, like a colour that was never
 * resolved.
 */
export const parseStopColor = (color: string): Rgba => {
  if (color === 'transparent') return [0, 0, 0, 0];
  if (HEX.test(color)) {
    const digits = color.slice(1);
    const short = digits.length <= 4;
    const read = (index: number) =>
      short
        ? parseInt(digits[index] + digits[index], 16)
        : parseInt(digits.slice(index * 2, index * 2 + 2), 16);
    const hasAlpha = digits.length === 4 || digits.length === 8;
    return [read(0), read(1), read(2), hasAlpha ? read(3) / 255 : 1];
  }
  const match = RGB.exec(color);
  if (match) {
    return [
      Number(match[1]),
      Number(match[2]),
      Number(match[3]),
      match[4] === undefined ? 1 : Number(match[4]),
    ];
  }
  throw new Error(
    `Gradient stop colour "${color}" is not a literal colour (hex, rgb(), rgba() or transparent)`,
  );
};

/** The colour of a gradient at `position` (0–1), between its stops. */
const colorAt = (stops: GradientStop[], position: number): Rgba => {
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  if (position <= sorted[0].position) return parseStopColor(sorted[0].color);
  for (let index = 1; index < sorted.length; index += 1) {
    const before = sorted[index - 1];
    const after = sorted[index];
    if (position > after.position) continue;
    const span = after.position - before.position;
    // Two stops at one position are a hard edge: the later one wins.
    if (span <= 0) return parseStopColor(after.color);
    const from = parseStopColor(before.color);
    const to = parseStopColor(after.color);
    const mix = (position - before.position) / span;
    // A transparent stop takes the hue of its neighbour, so a fade to
    // transparent does not pass through grey.
    const hue = (side: Rgba, other: Rgba) => (side[3] === 0 ? other : side);
    const a = hue(from, to);
    const b = hue(to, from);
    return [
      a[0] + (b[0] - a[0]) * mix,
      a[1] + (b[1] - a[1]) * mix,
      a[2] + (b[2] - a[2]) * mix,
      from[3] + (to[3] - from[3]) * mix,
    ];
  }
  return parseStopColor(sorted[sorted.length - 1].color);
};

/**
 * The wedges that draw a conic gradient in a box: each a thin triangle from
 * the centre to a circle that covers the whole box, in the gradient's colour
 * at that angle. Fully transparent wedges are left out.
 *
 * @param stops - The gradient's stops (at least two)
 * @param width - The box's width in points
 * @param height - The box's height in points
 * @param center - The centre in normalized object space
 * @param angle - Degrees the sweep starts at; 0 points up
 * @param repeat - How many times the stops repeat around the circle
 */
export const conicWedges = (
  stops: GradientStop[],
  width: number,
  height: number,
  center: { x: number; y: number },
  angle: number,
  repeat: number,
): ConicWedge[] => {
  const cx = center.x * width;
  const cy = center.y * height;
  // Reaches the farthest corner from any centre inside the box.
  const reach = Math.hypot(width, height);
  const step = (2 * Math.PI) / CONIC_WEDGES;
  // 0° points up and the sweep runs clockwise, as in CSS.
  const start = ((angle - 90) * Math.PI) / 180;
  const point = (theta: number) =>
    `${(cx + Math.cos(theta) * reach).toFixed(2)} ${(cy + Math.sin(theta) * reach).toFixed(2)}`;

  const wedges: ConicWedge[] = [];
  for (let index = 0; index < CONIC_WEDGES; index += 1) {
    const turn = (index + 0.5) / CONIC_WEDGES;
    const [r, g, b, a] = colorAt(stops, (turn * repeat) % 1);
    if (a <= 0) continue;
    const from = start + index * step;
    // A sliver of overlap hides the seam between neighbours.
    const to = from + step * 1.02;
    wedges.push({
      path: `M${cx.toFixed(2)} ${cy.toFixed(2)}L${point(from)}L${point(to)}Z`,
      color: `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`,
      opacity: a,
    });
  }
  return wedges;
};
