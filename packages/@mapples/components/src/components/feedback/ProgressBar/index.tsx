import {
  forwardRef,
  PropsWithChildren,
  useState,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView, Typography, useStyled } from '@mapples/style';
import { Tokens, Tone, TYPOGRAPHY_PARTS, useTones } from '@mapples/ui';
import {
  Animated,
  I18nManager,
  LayoutChangeEvent,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import {
  useLoopValue,
  useReduceMotion,
  useSlotColor,
  useTimingValue,
} from '../../../internal';

import { defaults } from './defaults';
import {
  PROGRESS_BAR_INDETERMINATE_WIDTH,
  PROGRESS_BAR_MARKER_OVERHANG,
  PROGRESS_BAR_MARKER_WIDTH,
  PROGRESS_BAR_SEGMENT_GAP,
  PROGRESS_BAR_TRACK,
  ProgressBarSize,
  progressFraction,
  readSegmentCount,
} from './types';

/** Props for {@link ProgressBar}. */
export interface ProgressBarProps extends Omit<ViewProps, 'children'> {
  /** Current progress, from 0 to `max`. Defaults to `0`. */
  value?: number;
  /** The value that fills the bar. Defaults to `100`. */
  max?: number;
  /** Shows a sliding fill instead of a value (unknown duration). */
  indeterminate?: boolean;
  /** Colour role of the fill. Defaults to `primary`. */
  tone?: Tone;
  /** Track thickness: `xs` 2 (a hairline), `sm` 4, `md` 8, `lg` 12. Defaults to `md`. */
  size?: ProgressBarSize;
  /**
   * Splits the track into this many equal bars with a small gap, filled up
   * to `value / max` ("Exercise 2 of 6": `value={2} max={6} segments={6}`).
   * Must be a positive whole number. Ignored while `indeterminate`.
   */
  segments?: number;
  /**
   * Draws a thin vertical tick at this value (0 to `max`), e.g. "today" on a
   * budget bar.
   */
  markerValue?: number;
  /** Shows the percentage after the track. */
  showLabel?: boolean;
  /** Custom text in place of the percentage ('3 of 5'); shown even without `showLabel`. */
  label?: string;
  /** Rounds the track and fill ends. Defaults to `true`. */
  rounded?: boolean;
  /** Styled slots for every visual part. */
  styled?: {
    /** The row holding track and label. */
    style?: StyledProp<ViewStyle>;
    /** The track — each bar when segmented (its `backgroundColor` is the track colour). */
    styleTrack?: StyledProp<ViewStyle>;
    /** The fill (its `backgroundColor` is the fill colour). */
    styleFill?: StyledProp<ViewStyle>;
    /** The `markerValue` tick (its `backgroundColor` is the tick colour). */
    styleMarker?: StyledProp<ViewStyle>;
    /** The label text. */
    styleLabel?: StyledProp<TextStyle>;
  };
}

/**
 * A linear progress indicator: a track with a tone-coloured fill that eases
 * to `value / max`, or an `indeterminate` sweep while the duration is
 * unknown. The track can split into equal `segments` and carry a
 * `markerValue` tick. Stretches across its parent; an optional percentage or
 * custom label sits after the track.
 *
 * @example
 * ```tsx
 * <ProgressBar value={uploaded} max={total} showLabel />
 * <ProgressBar indeterminate size="sm" />
 * <ProgressBar value={2} max={6} segments={6} label="2 of 6" />
 * <ProgressBar value={spent} max={budget} markerValue={dayOfMonth / 30 * budget} />
 * ```
 *
 * @public
 */
const ProgressBar: ForwardRefExoticComponent<
  PropsWithChildren<ProgressBarProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<ProgressBarProps>>(
  (
    {
      value = 0,
      max = 100,
      indeterminate = false,
      tone = 'primary',
      size = 'md',
      showLabel = false,
      label,
      rounded = true,
      segments,
      markerValue,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const fraction = indeterminate
      ? 0
      : progressFraction(value, max, 'ProgressBar');
    const segmentCount =
      segments === undefined || indeterminate
        ? undefined
        : readSegmentCount(segments, 'ProgressBar');
    const markerFraction =
      markerValue === undefined
        ? undefined
        : progressFraction(markerValue, max, 'ProgressBar');

    const tones = useTones();
    const palette = tones.tone(tone);
    const [trackWidth, setTrackWidth] = useState(0);
    const reduceMotion = useReduceMotion();

    const scaleX = useTimingValue(fraction);
    const slide = useLoopValue({
      duration: 1200,
      running: indeterminate && trackWidth > 0,
      reverse: false,
    });
    const trackColor = useSlotColor(
      styled?.styleTrack,
      'backgroundColor',
      tones.fill,
    );
    const fillColor = useSlotColor(
      styled?.styleFill,
      'backgroundColor',
      palette.main,
    );
    const resolved = useStyled({ fill: styled?.styleFill }) as {
      fill?: ViewStyle;
    };

    const thickness = PROGRESS_BAR_TRACK[size];
    const radius = rounded ? thickness / 2 : 0;
    const isRTL = I18nManager.isRTL;
    const sweepWidth = PROGRESS_BAR_INDETERMINATE_WIDTH * trackWidth;
    // The sweep enters from the reading start and leaves at the reading end.
    const translateX = slide.interpolate({
      inputRange: [0, 1],
      outputRange: isRTL
        ? [trackWidth, -sweepWidth]
        : [-sweepWidth, trackWidth],
    });

    const percent = Math.round(fraction * 100);
    const text = label || (showLabel && !indeterminate ? `${percent}%` : '');

    const onLayout = (event: LayoutChangeEvent) =>
      setTrackWidth(event.nativeEvent.layout.width);

    const continuousTrack = (
      <StyledView
        onLayout={onLayout}
        styled={{
          style: [
            defaults.track,
            {
              height: thickness,
              borderRadius: radius,
              backgroundColor: trackColor,
            },
            styled?.styleTrack,
          ],
        }}
      >
        {indeterminate ? (
          <Animated.View
            pointerEvents="none"
            style={[
              defaults.fill,
              {
                width: `${PROGRESS_BAR_INDETERMINATE_WIDTH * 100}%`,
                borderRadius: radius,
                backgroundColor: fillColor,
              },
              resolved.fill,
              {
                // With reduced motion the sweep rests at the start instead of vanishing.
                transform: [{ translateX: reduceMotion ? 0 : translateX }],
              },
            ]}
          />
        ) : (
          <Animated.View
            pointerEvents="none"
            style={[
              defaults.fill,
              {
                width: '100%',
                borderRadius: radius,
                backgroundColor: fillColor,
                transformOrigin: isRTL ? 'right' : 'left',
              },
              resolved.fill,
              { transform: [{ scaleX }] },
            ]}
          />
        )}
      </StyledView>
    );

    const bar =
      segmentCount === undefined ? (
        continuousTrack
      ) : (
        <StyledView
          styled={{
            style: [defaults.segments, { gap: PROGRESS_BAR_SEGMENT_GAP }],
          }}
        >
          {Array.from({ length: segmentCount }, (_, index) => (
            <StyledView
              key={index}
              styled={{
                style: [
                  defaults.track,
                  {
                    height: thickness,
                    borderRadius: radius,
                    backgroundColor: trackColor,
                  },
                  styled?.styleTrack,
                ],
              }}
            >
              <Animated.View
                pointerEvents="none"
                style={[
                  defaults.fill,
                  {
                    width: '100%',
                    borderRadius: radius,
                    backgroundColor: fillColor,
                    transformOrigin: isRTL ? 'right' : 'left',
                  },
                  resolved.fill,
                  {
                    transform: [
                      {
                        // Each bar fills its own slice of the overall fraction.
                        scaleX: scaleX.interpolate({
                          inputRange: [
                            index / segmentCount,
                            (index + 1) / segmentCount,
                          ],
                          outputRange: [0, 1],
                          extrapolate: 'clamp',
                        }),
                      },
                    ],
                  },
                ]}
              />
            </StyledView>
          ))}
        </StyledView>
      );

    const marker =
      markerFraction === undefined ? null : (
        <StyledView
          pointerEvents="none"
          styled={{
            style: [
              defaults.marker,
              {
                start: `${markerFraction * 100}%`,
                top: -PROGRESS_BAR_MARKER_OVERHANG,
                bottom: -PROGRESS_BAR_MARKER_OVERHANG,
                width: PROGRESS_BAR_MARKER_WIDTH,
                marginStart: -PROGRESS_BAR_MARKER_WIDTH / 2,
                borderRadius: PROGRESS_BAR_MARKER_WIDTH / 2,
                backgroundColor: tones.resolve(Tokens.color.text),
              },
              styled?.styleMarker,
            ],
          }}
        />
      );

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
        {marker ? (
          <StyledView styled={{ style: defaults.markerFrame }}>
            {bar}
            {marker}
          </StyledView>
        ) : (
          bar
        )}
        {text ? (
          <Typography
            variant={TYPOGRAPHY_PARTS.helper}
            numberOfLines={1}
            style={[
              defaults.label,
              { color: tones.resolve(Tokens.color.textSecondary) },
              styled?.styleLabel,
            ]}
          >
            {text}
          </Typography>
        ) : null}
      </StyledView>
    );
  },
);
ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
