import { FC } from 'react';

import { StyledProp, useStyled } from '@mapples/style';
import { useShape } from '@mapples/ui';
import { Animated, ViewStyle } from 'react-native';

import { useTimingValue } from '../../../internal';

import { defaults } from './defaults';
import { TabLayout, TabsVariant } from './types';

export interface IndicatorProps {
  /** The active tab's measured position. */
  layout: TabLayout;
  variant: TabsVariant;
  /** Row height (the pill fills it). */
  height: number;
  /** Underline thickness in points. */
  thickness: number;
  /** Points kept clear of each side of the tab. */
  inset: number;
  /** Resolved indicator colour. */
  color: string;
  /** Author slot for the indicator. */
  styled?: StyledProp<ViewStyle>;
}

/**
 * The bar or pill that slides under/behind the active tab. Two layers keep
 * the drivers apart: the outer view translates on the native driver, the
 * inner view animates its width on the JS driver (layout cannot run
 * natively). Mount it once a layout exists so it starts in place.
 */
const Indicator: FC<IndicatorProps> = ({
  layout,
  variant,
  height,
  thickness,
  inset,
  color,
  styled,
}) => {
  const shape = useShape();
  // An inset wider than half the tab leaves no indicator rather than a
  // negative width.
  const translateX = useTimingValue(layout.x + inset);
  const width = useTimingValue(Math.max(0, layout.width - inset * 2), {
    native: false,
  });
  const resolved = useStyled({ indicator: styled }) as {
    indicator?: ViewStyle;
  };
  const underline = variant === 'underline';

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        defaults.indicatorTrack,
        underline ? { bottom: 0, height: thickness } : { top: 0, height },
        { transform: [{ translateX }] },
      ]}
    >
      <Animated.View
        style={[
          {
            height: '100%',
            backgroundColor: color,
            borderRadius: underline ? thickness : shape.radius.pill,
          },
          resolved.indicator,
          { width },
        ]}
      />
    </Animated.View>
  );
};

export default Indicator;
