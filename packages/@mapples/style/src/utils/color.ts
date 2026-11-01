/**
 * Colour arithmetic on resolved colour strings. Library components derive
 * their neutral surfaces (outlines, fills, dividers, backdrops, state layers)
 * from a theme colour at an alpha instead of the palette's neutral scale,
 * which is not inverted for dark themes.
 */

const HEX = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+\s*)?\)$/i;

const clampAlpha = (alpha: number) => Math.min(1, Math.max(0, alpha));

const expandHex = (hex: string): [number, number, number] => {
  const digits = hex.slice(1);
  const short = digits.length === 3 || digits.length === 4;
  const read = (index: number) =>
    short
      ? parseInt(digits[index] + digits[index], 16)
      : parseInt(digits.slice(index * 2, index * 2 + 2), 16);
  return [read(0), read(1), read(2)];
};

/**
 * Returns `color` as an `rgba(r, g, b, alpha)` string. Accepts `#rgb`,
 * `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb()` and `rgba()` (an existing alpha is
 * replaced) and passes `transparent` through. Anything else — typically an
 * unresolved token — is a programming error and throws.
 *
 * @example
 * ```ts
 * withAlpha('#1a1a1a', 0.12); // 'rgba(26, 26, 26, 0.12)'
 * ```
 */
const toRgb = (color: string): [number, number, number] => {
  if (HEX.test(color)) return expandHex(color);
  const match = RGB.exec(color);
  if (match) return [Number(match[1]), Number(match[2]), Number(match[3])];
  throw new Error(
    `contrastRatio: "${color}" is not a resolved colour — resolve theme tokens with getColor first`,
  );
};

const relativeLuminance = (color: string): number => {
  const [r, g, b] = toRgb(color).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * WCAG contrast ratio of two resolved colours, from 1 (same) to 21 (black on
 * white). Alpha is ignored. Throws on anything that is not a colour, like
 * {@link withAlpha}.
 *
 * @example
 * ```ts
 * contrastRatio('#C6F432', '#FFFFFF'); // ≈ 1.3 — fill only, never text
 * ```
 */
export const contrastRatio = (a: string, b: string): number => {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x,
  );
  return (light + 0.05) / (dark + 0.05);
};

export const withAlpha = (color: string, alpha: number): string => {
  if (color === 'transparent') return color;
  const a = clampAlpha(alpha);
  if (HEX.test(color)) {
    const [r, g, b] = expandHex(color);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  const match = RGB.exec(color);
  if (match) {
    return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${a})`;
  }
  throw new Error(
    `withAlpha: "${color}" is not a resolved colour — resolve theme tokens with getColor first`,
  );
};
