import { FC } from 'react';

import Svg, { Path } from 'react-native-svg';

import { NUMERIC_KEYPAD_GLYPHS, NumericKeypadGlyphName } from './types';

/** Props for {@link KeypadGlyph}. */
export interface KeypadGlyphProps {
  /** Which built-in glyph to draw. */
  name: NumericKeypadGlyphName;
  /** Edge in points (the glyph is square). */
  size: number;
  /** A resolved colour. */
  color: string;
}

/**
 * The keypad's built-in backspace and fingerprint glyphs — drawn with SVG so
 * they need no icon family; `backspaceIconName` / `biometricIconName` swap in
 * a project icon instead.
 *
 * @internal
 */
const KeypadGlyph: FC<KeypadGlyphProps> = ({ name, size, color }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    color={color}
    pointerEvents="none"
  >
    <Path d={NUMERIC_KEYPAD_GLYPHS[name]} fill="currentColor" />
  </Svg>
);

export default KeypadGlyph;
