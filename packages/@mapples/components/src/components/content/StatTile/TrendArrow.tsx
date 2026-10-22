import { FC } from 'react';

import Svg, { Path } from 'react-native-svg';

/** Diagonal arrows on a 24 × 24 grid (north-east and south-east). */
const ARROW_PATHS = {
  up: 'M9 5v2h6.59L4 18.59 5.41 20 17 8.41V15h2V5H9z',
  down: 'M19 9h-2v6.59L5.41 4 4 5.41 15.59 17H9v2h10V9z',
} as const;

export interface TrendArrowProps {
  /** `up` draws an up-right arrow, `down` a down-right one. */
  direction: keyof typeof ARROW_PATHS;
  /** Rendered size in points (the glyph is square). */
  size: number;
  /** A resolved colour. */
  color: string;
}

/**
 * The tile's diagonal trend arrow, drawn inline so it renders the same
 * whatever icon family the project picked (like the library's chevrons).
 */
const TrendArrow: FC<TrendArrowProps> = ({ direction, size, color }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    color={color}
    pointerEvents="none"
  >
    <Path d={ARROW_PATHS[direction]} fill="currentColor" />
  </Svg>
);

export default TrendArrow;
