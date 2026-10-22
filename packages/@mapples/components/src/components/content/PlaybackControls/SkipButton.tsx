import { FC } from 'react';

import { StyledProp, StyledView, Typography } from '@mapples/style';
import { IconButton, Tone, TYPOGRAPHY_PARTS } from '@mapples/ui';
import { TextStyle, ViewStyle } from 'react-native';

import { defaults } from './defaults';

export interface SkipButtonProps {
  /** Project-family glyph of the circular arrow. */
  iconName: string;
  /** Draws the glyph mirrored (a clockwise arrow read as counter-clockwise). */
  mirrored: boolean;
  /** Step in seconds, drawn as a small number inside the arrow. */
  seconds: number;
  /** `IconButton` size of the button box. */
  size: 'md' | 'lg';
  /** Glyph size in points. */
  glyphSize: number;
  /** Font size of the number. */
  labelSize: number;
  /** Resolved glyph and number colour. */
  color: string;
  /** Colour role of the press state layer. */
  tone: Tone;
  /** Screen-reader label ('Skip back 15 seconds'). */
  accessibilityLabel: string;
  /** Fires on press. */
  onPress?: () => void;
  /** Author slot for the button box. */
  style?: StyledProp<ViewStyle>;
  /** Author slot for the number. */
  styleLabel?: StyledProp<TextStyle>;
}

/**
 * A round skip button: a circular-arrow glyph from the project family with
 * the step drawn as a small number inside it. Shared by `PlaybackControls`
 * and `MiniPlayer`.
 */
const SkipButton: FC<SkipButtonProps> = ({
  iconName,
  mirrored,
  seconds,
  size,
  glyphSize,
  labelSize,
  color,
  tone,
  accessibilityLabel,
  onPress,
  style,
  styleLabel,
}) => (
  <IconButton
    iconName={iconName}
    variant="standard"
    size={size}
    tone={tone}
    accessibilityLabel={accessibilityLabel}
    onPress={onPress}
    styled={{
      style: [defaults.button, style],
      styleSvg: [
        { width: glyphSize, color },
        mirrored ? defaults.mirrored : undefined,
      ],
    }}
  >
    <StyledView
      pointerEvents="none"
      styled={{ style: defaults.skipLabelLayer }}
    >
      <Typography
        variant={TYPOGRAPHY_PARTS.helper}
        // The arrow already carries the label; the number is decoration.
        accessible={false}
        style={[
          defaults.skipLabel,
          { color, fontSize: labelSize, lineHeight: labelSize + 2 },
          styleLabel,
        ]}
      >
        {seconds}
      </Typography>
    </StyledView>
  </IconButton>
);

export default SkipButton;
