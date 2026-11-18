import {
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView, Typography } from '@mapples/style';
import { Tokens, Tone, TYPOGRAPHY_PARTS, useTones } from '@mapples/ui';
import { TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import { useSlotColor } from '../../../internal';

import { defaults } from './defaults';
import { LIVE_INDICATOR_DOT, LiveIndicatorSize } from './types';

/** Props for {@link LiveIndicator}. */
export interface LiveIndicatorProps extends Omit<ViewProps, 'children'> {
  /** Text beside the dot ('Live', 'Online', 'Recording'). */
  label?: string;
  /** Whether it is live: the dot is in the tone and a ring pulses out of it. Defaults to `true`. */
  active?: boolean;
  /** Colour role of the live dot. Defaults to `success`. */
  tone?: Tone;
  /** Dot diameter: `sm` 6, `md` 8, `lg` 12. Defaults to `md`. */
  size?: LiveIndicatorSize;
  /** Styled slots. */
  styled?: {
    /** The row of dot and label. */
    style?: StyledProp<ViewStyle>;
    /** The dot (`color` repaints it and its ring). */
    styleDot?: StyledProp<ViewStyle & { color?: string }>;
    /** The label. */
    styleLabel?: StyledProp<TextStyle>;
  };
}

/**
 * A status that is happening now: a dot with a ring pulsing out of it and an
 * optional label — a live stream, a courier on the way, a user online, a
 * recording. The pulse is the one loop a calm screen can afford, so use one
 * per screen. Not `active`, the dot rests in a muted colour and nothing
 * moves; nor with reduced motion.
 *
 * @example
 * ```tsx
 * <LiveIndicator label="Live" tone="error" />
 * ```
 *
 * @public
 */
const LiveIndicator: ForwardRefExoticComponent<
  PropsWithChildren<LiveIndicatorProps> &
    RefAttributes<ComponentRef<typeof View>>
> = forwardRef<
  ComponentRef<typeof View>,
  PropsWithChildren<LiveIndicatorProps>
>(
  (
    {
      label,
      active = true,
      tone = 'success',
      size = 'md',
      accessibilityLabel,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const liveColor = useSlotColor(
      styled?.styleDot,
      'color',
      tones.tone(tone).main,
    );
    const color = active ? liveColor : tones.resolve(Tokens.color.textTertiary);
    const diameter = LIVE_INDICATOR_DOT[size];
    const shape = { borderRadius: diameter / 2, backgroundColor: color };

    return (
      <StyledView
        ref={ref}
        accessible
        accessibilityRole="text"
        accessibilityLabel={accessibilityLabel ?? label}
        styled={{ style: [defaults.root, styled?.style] }}
        {...rest}
      >
        <StyledView
          styled={{
            style: [defaults.dotBox, { width: diameter, height: diameter }],
          }}
        >
          {active ? (
            <StyledView
              pointerEvents="none"
              styled={{ style: [defaults.ring, shape] }}
            />
          ) : null}
          <StyledView
            styled={{
              style: [{ width: diameter, height: diameter }, shape],
            }}
          />
        </StyledView>
        {label ? (
          <Typography
            variant={TYPOGRAPHY_PARTS.helper}
            // One line, cut rather than ellipsized: in a row sized by its
            // content the text is a fraction of a point narrower than it
            // measures on iOS, and an ellipsis would eat its last letters.
            numberOfLines={1}
            ellipsizeMode="clip"
            style={[
              { color: tones.resolve(Tokens.color.text) },
              styled?.styleLabel,
            ]}
          >
            {label}
          </Typography>
        ) : null}
      </StyledView>
    );
  },
);
LiveIndicator.displayName = 'LiveIndicator';

export default LiveIndicator;
