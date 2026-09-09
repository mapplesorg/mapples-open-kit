import { FC } from 'react';

import { StyleProp, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { GLYPH_PATHS, GlyphName } from './paths';

export interface GlyphProps {
  /** Which structural glyph to draw. */
  name: GlyphName;
  /** Rendered size in points (the glyph is square). */
  size?: number;
  /** A resolved colour — the path uses `currentColor`. */
  color: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * A structural glyph on a 24-point grid. The `Path` fills with
 * `currentColor`, which react-native-svg reads from the `Svg` `color` prop on
 * native and the web alike.
 */
const Glyph: FC<GlyphProps> = ({ name, size = 20, color, style, testID }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    color={color}
    style={style}
    testID={testID}
    pointerEvents="none"
  >
    <Path d={GLYPH_PATHS[name]} fill="currentColor" />
  </Svg>
);

export default Glyph;
