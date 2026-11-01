import { FC } from 'react';

import { StyleSheet } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import {
  DividerDashStyle,
  dividerDashArray,
  DividerOrientation,
} from './types';

/** Props for {@link DashedLine}. */
export interface DashedLineProps {
  /** Direction the line runs in. */
  orientation: DividerOrientation;
  /** Dashes or dots. */
  lineStyle: DividerDashStyle;
  /** Stroke width in points. */
  thickness: number;
  /** Stroke colour (concrete, tokens resolved). */
  color: string;
}

/**
 * A dashed or dotted line drawn with SVG, filling its parent box — native
 * cannot dash a single border side reliably. The parent sets the length and
 * the thickness; the stroke runs along its centre.
 *
 * @internal
 */
const DashedLine: FC<DashedLineProps> = ({
  orientation,
  lineStyle,
  thickness,
  color,
}) => {
  const [dash, gap] = dividerDashArray(lineStyle, thickness);
  const centre = thickness / 2;
  const vertical = orientation === 'vertical';

  return (
    <Svg
      pointerEvents="none"
      width="100%"
      height="100%"
      style={StyleSheet.absoluteFill}
    >
      <Line
        x1={vertical ? centre : 0}
        y1={vertical ? 0 : centre}
        x2={vertical ? centre : '100%'}
        y2={vertical ? '100%' : centre}
        stroke={color}
        strokeWidth={thickness}
        strokeDasharray={[dash, gap]}
        strokeLinecap="butt"
      />
    </Svg>
  );
};

export default DashedLine;
