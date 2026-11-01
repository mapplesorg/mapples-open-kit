import {
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView, Typography } from '@mapples/style';
import { Icon, Tokens, TYPOGRAPHY_PARTS, useTones } from '@mapples/ui';
import { TextStyle, View, ViewProps, ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { readSlot, useSlotColor } from '../../../internal';

import { defaults } from './defaults';
import {
  ACTIVITY_RINGS_DEFAULTS,
  ACTIVITY_RINGS_TONES,
  ACTIVITY_RINGS_TRACK_OPACITY,
  ActivityRing,
  activityRingsSummary,
  readActivityRings,
} from './types';

/** Props for {@link ActivityRings}. */
export interface ActivityRingsProps extends Omit<ViewProps, 'children'> {
  /** One to five rings, outermost first: `[{ value, max, tone?, color?, label? }]`. Values above `max` draw a full ring. */
  rings?: ActivityRing[];
  /** Edge of the whole dial in points. Defaults to `160`. */
  size?: number;
  /** Thickness of every ring in points. Defaults to `14`. */
  strokeWidth?: number;
  /** Space between neighbouring rings in points. Defaults to `4`. */
  gap?: number;
  /** Text in the centre. */
  label?: string;
  /** Glyph in the centre, above the label (project icon family). */
  iconName?: string;
  /** Styled slots for every visual part. */
  styled?: {
    /** The box around the dial. */
    style?: StyledProp<ViewStyle>;
    /** Every track (its `color` replaces the faded ring colour). */
    styleTrack?: StyledProp<ViewStyle & { color?: string }>;
    /** The centre label (its `color` also tints the glyph). */
    styleLabel?: StyledProp<TextStyle>;
  };
}

/**
 * Concentric progress rings drawn with SVG — fitness goals (move, exercise,
 * stand), daily targets, nutrition. Each ring has its own faded track and a
 * round-capped fill covering `value / max`; a value above `max` closes the
 * ring (overachieving is valid, not an error). A label and/or glyph can sit
 * in the centre.
 *
 * @example
 * ```tsx
 * <ActivityRings
 *   rings={[
 *     { label: 'Move', value: 420, max: 600 },
 *     { label: 'Exercise', value: 22, max: 30 },
 *     { label: 'Stand', value: 9, max: 12 },
 *   ]}
 * />
 * ```
 *
 * @public
 */
const ActivityRings: ForwardRefExoticComponent<
  PropsWithChildren<ActivityRingsProps> &
    RefAttributes<ComponentRef<typeof View>>
> = forwardRef<
  ComponentRef<typeof View>,
  PropsWithChildren<ActivityRingsProps>
>(
  (
    {
      rings,
      size = ACTIVITY_RINGS_DEFAULTS.size,
      strokeWidth = ACTIVITY_RINGS_DEFAULTS.strokeWidth,
      gap = ACTIVITY_RINGS_DEFAULTS.gap,
      label,
      iconName,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const component = 'ActivityRings';
    const resolved = readActivityRings(rings, component);
    if (!(size > 0)) {
      throw new Error(`${component}: size (${String(size)}) must be positive`);
    }
    if (!(strokeWidth > 0)) {
      throw new Error(
        `${component}: strokeWidth (${String(strokeWidth)}) must be positive`,
      );
    }
    if (!(gap >= 0)) {
      throw new Error(`${component}: gap (${String(gap)}) must be 0 or more`);
    }
    const count = resolved.length;
    // Diameter of the hole left inside the innermost ring.
    const inner = size - 2 * (count * strokeWidth + (count - 1) * gap);
    if (!(inner > 0)) {
      throw new Error(
        `${component}: ${count} rings of strokeWidth ${strokeWidth} and gap ${gap} do not fit in size ${size}`,
      );
    }

    const tones = useTones();
    const text = tones.resolve(Tokens.color.text);
    // A track colour from the slot replaces every ring's faded own colour.
    const trackSlot = readSlot(styled?.styleTrack, 'color');
    const trackColor =
      typeof trackSlot === 'string' ? tones.resolve(trackSlot) : undefined;
    const labelColor = useSlotColor(styled?.styleLabel, 'color', text);
    const centre = size / 2;

    return (
      <StyledView
        ref={ref}
        accessible
        accessibilityRole="image"
        accessibilityLabel={
          activityRingsSummary(resolved) + (label ? `, ${label}` : '')
        }
        styled={{
          style: [defaults.root, { width: size, height: size }, styled?.style],
        }}
        {...rest}
      >
        <Svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          // SVG angles start at 3 o'clock; turn so every ring starts at 12.
          style={{ transform: [{ rotate: '-90deg' }] }}
        >
          {resolved.map((ring, index) => {
            const radius =
              (size - strokeWidth) / 2 - index * (strokeWidth + gap);
            const circumference = 2 * Math.PI * radius;
            const color =
              ring.color !== undefined
                ? tones.resolve(ring.color)
                : tones.tone(
                    ring.tone ??
                      ACTIVITY_RINGS_TONES[index % ACTIVITY_RINGS_TONES.length],
                  ).main;
            return [
              <Circle
                key={`track-${index}`}
                cx={centre}
                cy={centre}
                r={radius}
                fill="none"
                stroke={trackColor ?? color}
                strokeOpacity={
                  trackColor === undefined ? ACTIVITY_RINGS_TRACK_OPACITY : 1
                }
                strokeWidth={strokeWidth}
              />,
              ring.fraction > 0 ? (
                <Circle
                  key={`fill-${index}`}
                  cx={centre}
                  cy={centre}
                  r={radius}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={[circumference, circumference]}
                  strokeDashoffset={circumference * (1 - ring.fraction)}
                />
              ) : null,
            ];
          })}
        </Svg>
        {label || iconName ? (
          <StyledView pointerEvents="none" styled={{ style: defaults.centre }}>
            {iconName ? (
              <Icon
                iconName={iconName}
                size={Math.round(Math.min(32, inner * 0.35))}
                color={labelColor}
              />
            ) : null}
            {label ? (
              <Typography
                variant={TYPOGRAPHY_PARTS.title}
                numberOfLines={1}
                style={[
                  defaults.label,
                  { color: text, maxWidth: inner * 0.85 },
                  styled?.styleLabel,
                ]}
              >
                {label}
              </Typography>
            ) : null}
          </StyledView>
        ) : null}
      </StyledView>
    );
  },
);
ActivityRings.displayName = 'ActivityRings';

export default ActivityRings;
