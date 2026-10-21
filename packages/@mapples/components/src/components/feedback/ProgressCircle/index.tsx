import {
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView, Typography } from '@mapples/style';
import { Icon, Tokens, Tone, TYPOGRAPHY_PARTS, useTones } from '@mapples/ui';
import { Animated, TextStyle, View, ViewProps, ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useLoopValue, useSlotColor } from '../../../internal';
import { progressFraction } from '../ProgressBar/types';

import { defaults } from './defaults';
import {
  circleGeometry,
  PROGRESS_CIRCLE_INDETERMINATE_ARC,
  ProgressCircleVariant,
} from './types';

/** Props for {@link ProgressCircle}. */
export interface ProgressCircleProps extends Omit<ViewProps, 'children'> {
  /** Current progress, from 0 to `max`. Defaults to `0`. */
  value?: number;
  /** The value that closes the circle. Defaults to `100`. */
  max?: number;
  /** Edge of the circle in points. Defaults to `48`. */
  size?: number;
  /** Stroke thickness in points. Defaults to `4`. */
  strokeWidth?: number;
  /** A full ring, or a 240° gauge open at the bottom with min/max labels. Defaults to `ring`. */
  variant?: ProgressCircleVariant;
  /** Spins a short arc instead of showing a value (unknown duration). */
  indeterminate?: boolean;
  /** Colour role of the fill. Defaults to `primary`. */
  tone?: Tone;
  /** Shows the percentage in the centre. */
  showLabel?: boolean;
  /** Custom centre text in place of the percentage; shown even without `showLabel`. */
  label?: string;
  /** Glyph in the centre instead of the text (project icon family). */
  iconName?: string;
  /** Styled slots for every visual part. */
  styled?: {
    /** The box around the circle. */
    style?: StyledProp<ViewStyle>;
    /** The track stroke (its `color` is the stroke colour). */
    styleTrack?: StyledProp<ViewStyle & { color?: string }>;
    /** The fill stroke (its `color` is the stroke colour). */
    styleFill?: StyledProp<ViewStyle & { color?: string }>;
    /** The centre label. */
    styleLabel?: StyledProp<TextStyle>;
  };
}

/**
 * A circular progress indicator drawn with SVG: a ring (or a gauge open at
 * the bottom) whose tone-coloured stroke covers `value / max`, with the
 * percentage, a custom label or a glyph in the centre. `indeterminate` spins
 * a short arc while the duration is unknown.
 *
 * @example
 * ```tsx
 * <ProgressCircle value={72} showLabel />
 * <ProgressCircle variant="gauge" value={3.2} max={5} label="3.2" size={96} strokeWidth={8} />
 * ```
 *
 * @public
 */
const ProgressCircle: ForwardRefExoticComponent<
  PropsWithChildren<ProgressCircleProps> &
    RefAttributes<ComponentRef<typeof View>>
> = forwardRef<
  ComponentRef<typeof View>,
  PropsWithChildren<ProgressCircleProps>
>(
  (
    {
      value = 0,
      max = 100,
      size = 48,
      strokeWidth = 4,
      variant = 'ring',
      indeterminate = false,
      tone = 'primary',
      showLabel = false,
      label,
      iconName,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    if (!(size > 0)) {
      throw new Error(`ProgressCircle: size (${size}) must be positive`);
    }
    if (!(strokeWidth > 0) || strokeWidth * 2 >= size) {
      throw new Error(
        `ProgressCircle: strokeWidth (${strokeWidth}) must be positive and less than half the size (${size})`,
      );
    }
    const fraction = indeterminate
      ? PROGRESS_CIRCLE_INDETERMINATE_ARC
      : progressFraction(value, max, 'ProgressCircle');

    const tones = useTones();
    const palette = tones.tone(tone);
    const trackColor = useSlotColor(styled?.styleTrack, 'color', tones.fill);
    const fillColor = useSlotColor(styled?.styleFill, 'color', palette.main);
    const spin = useLoopValue({
      duration: 1000,
      running: indeterminate,
      reverse: false,
    });
    const rotate = spin.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    const gauge = variant === 'gauge';
    const { radius, circumference, arc, rotation } = circleGeometry(
      size,
      strokeWidth,
      variant,
    );
    const centre = size / 2;
    const percent = Math.round(fraction * 100);
    const centreText =
      label || (showLabel && !indeterminate ? `${percent}%` : '');
    const secondary = tones.resolve(Tokens.color.textSecondary);

    return (
      <StyledView
        ref={ref}
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max,
          now: indeterminate ? undefined : Math.min(Math.max(value, 0), max),
        }}
        accessibilityState={{ busy: indeterminate }}
        styled={{ style: [defaults.root, styled?.style] }}
        {...rest}
      >
        <StyledView
          styled={{ style: [defaults.dial, { width: size, height: size }] }}
        >
          <Animated.View
            pointerEvents="none"
            style={{ width: size, height: size, transform: [{ rotate }] }}
          >
            <Svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              style={{ transform: [{ rotate: `${rotation}deg` }] }}
            >
              <Circle
                cx={centre}
                cy={centre}
                r={radius}
                fill="none"
                stroke={trackColor}
                strokeWidth={strokeWidth}
                strokeLinecap={gauge ? 'round' : 'butt'}
                strokeDasharray={gauge ? [arc, circumference] : undefined}
              />
              <Circle
                cx={centre}
                cy={centre}
                r={radius}
                fill="none"
                stroke={fillColor}
                strokeWidth={strokeWidth}
                strokeLinecap={fraction > 0 ? 'round' : 'butt'}
                strokeDasharray={[arc, circumference]}
                strokeDashoffset={arc * (1 - fraction)}
              />
            </Svg>
          </Animated.View>
          <StyledView pointerEvents="none" styled={{ style: defaults.centre }}>
            {iconName ? (
              <Icon
                iconName={iconName}
                size={Math.round(size * 0.4)}
                color={palette.main}
              />
            ) : centreText ? (
              <Typography
                variant={TYPOGRAPHY_PARTS.label}
                numberOfLines={1}
                style={[
                  {
                    color: tones.resolve(Tokens.color.text),
                    fontSize: Math.round(size / 4),
                    lineHeight: Math.round(size * 0.3),
                    textAlign: 'center',
                  },
                  styled?.styleLabel,
                ]}
              >
                {centreText}
              </Typography>
            ) : null}
          </StyledView>
        </StyledView>
        {gauge ? (
          <StyledView
            pointerEvents="none"
            styled={{
              style: [
                defaults.bounds,
                { width: size, marginTop: -Math.round(size * 0.1) },
              ],
            }}
          >
            <Typography
              variant={TYPOGRAPHY_PARTS.helper}
              style={{ color: secondary }}
            >
              0
            </Typography>
            <Typography
              variant={TYPOGRAPHY_PARTS.helper}
              style={{ color: secondary }}
            >
              {String(max)}
            </Typography>
          </StyledView>
        ) : null}
      </StyledView>
    );
  },
);
ProgressCircle.displayName = 'ProgressCircle';

export default ProgressCircle;
