import { FC, useState } from 'react';

import { StyledProp, StyledView, Typography } from '@mapples/style';
import { TYPOGRAPHY_PARTS } from '@mapples/ui';
import { Animated, LayoutChangeEvent, TextStyle } from 'react-native';

import { defaults } from './defaults';
import { BOTTOM_NAVIGATION_EXPAND } from './types';

export interface ExpandLabelProps {
  /** The text beside the glyph. */
  label: string;
  /** 0 (collapsed) to 1 (open); a JS-driven value, since it drives a width. */
  expansion: Animated.Value;
  /** Whether the item is active; a collapsed label is hidden from assistive tech. */
  open: boolean;
  /** Text colour. */
  color: string;
  /** Author label style. */
  styleLabel?: StyledProp<TextStyle>;
  /** Author style of the active label (pass it only while active). */
  styleLabelActive?: StyledProp<TextStyle>;
}

/**
 * The label of an `expand` item: it slides out beside the glyph while the
 * item is active. The text is laid out at its natural width (capped, then
 * truncated) inside a clip whose width eases from 0 to that measured width,
 * so the pill grows and shrinks with the label instead of jumping.
 */
const ExpandLabel: FC<ExpandLabelProps> = ({
  label,
  expansion,
  open,
  color,
  styleLabel,
  styleLabelActive,
}) => {
  const [measured, setMeasured] = useState<number | null>(null);
  // Until the label has been measured the clip stays shut; the first layout
  // pass reports the width and the clip opens to it on the next frame.
  const width =
    measured === null
      ? 0
      : expansion.interpolate({
          inputRange: [0, 1],
          outputRange: [0, BOTTOM_NAVIGATION_EXPAND.gap + measured],
        });
  const onLayout = (event: LayoutChangeEvent) =>
    setMeasured(event.nativeEvent.layout.width);

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden={!open}
      importantForAccessibility={open ? 'auto' : 'no-hide-descendants'}
      style={[defaults.expandClip, { width }]}
    >
      <StyledView onLayout={onLayout} styled={{ style: defaults.expandLabel }}>
        <Typography
          variant={TYPOGRAPHY_PARTS.label}
          numberOfLines={1}
          style={[{ color }, styleLabel, styleLabelActive]}
        >
          {label}
        </Typography>
      </StyledView>
    </Animated.View>
  );
};

export default ExpandLabel;
