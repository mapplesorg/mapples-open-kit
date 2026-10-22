import {
  forwardRef,
  PropsWithChildren,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView, Typography } from '@mapples/style';
import {
  DISABLED_OPACITY,
  Tokens,
  Tone,
  TYPOGRAPHY_PARTS,
  useTones,
} from '@mapples/ui';
import {
  AccessibilityActionEvent,
  LayoutChangeEvent,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { useSlotColor } from '../../../internal';

import { defaults } from './defaults';
import {
  formatPlaybackTime,
  WAVEFORM_SEEK_BAR_ACCESSIBILITY_STEP,
  WAVEFORM_SEEK_BAR_GEOMETRY,
} from './types';

/** Props for {@link WaveformSeekBar}. */
export interface WaveformSeekBarProps extends Omit<ViewProps, 'children'> {
  /** Amplitudes of the episode, each `0..1`, in time order; resampled (peak per bucket) when more than fit. Required: missing, empty or out-of-range samples throw. */
  samples?: number[];
  /** Current playback position in seconds, `0..duration`, from the app's player. Required: missing or out-of-range throws. */
  position?: number;
  /** Length of the track in seconds (> 0), from the app's player — render the bar once it is known. Required: missing throws. */
  duration?: number;
  /** Fires with the target second on a tap and when a drag ends; the app seeks its player and passes the new `position`. */
  onSeek?: (seconds: number) => void;
  /** Fires with the second under the finger while dragging (the bar previews it until release). */
  onScrub?: (seconds: number) => void;
  /** Shows elapsed time on the left and remaining time (`-mm:ss`) on the right. */
  showTimes?: boolean;
  /** Height of the bar area in points. Defaults to `48`. */
  height?: number;
  /** Width of one amplitude bar in points. Defaults to `3`. */
  barWidth?: number;
  /** Minimum space between bars in points; spare width spreads between them. Defaults to `2`. */
  barGap?: number;
  /** Seconds the screen-reader increment/decrement actions move. Defaults to `15`. */
  accessibilityStepSeconds?: number;
  /** Colour role of the played bars and the playhead. Defaults to `primary`. */
  tone?: Tone;
  /** Disables seeking and dims the control. */
  disabled?: boolean;
  /** Styled slots for every visual part. */
  styled?: {
    /** The whole control. */
    style?: StyledProp<ViewStyle>;
    /** The bar area (the touch target). */
    styleBars?: StyledProp<ViewStyle>;
    /** An unplayed bar; `backgroundColor` paints it. */
    styleBar?: StyledProp<ViewStyle>;
    /** A played bar; `backgroundColor` paints it. */
    styleBarPlayed?: StyledProp<ViewStyle>;
    /** The playhead line. */
    stylePlayhead?: StyledProp<ViewStyle>;
    /** The elapsed and remaining times. */
    styleTime?: StyledProp<TextStyle>;
  };
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** The peak of each of `count` equal buckets of `samples`. */
const resample = (samples: number[], count: number): number[] => {
  if (count >= samples.length) return samples;
  const bucket = samples.length / count;
  return Array.from({ length: count }, (_, i) => {
    const start = Math.floor(i * bucket);
    const end = Math.max(start + 1, Math.floor((i + 1) * bucket));
    return Math.max(...samples.slice(start, end));
  });
};

const assertPositiveNumber = (name: string, value: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(
      `WaveformSeekBar: ${name} must be a number > 0 (got ${value})`,
    );
  }
};

/**
 * A seek bar drawn as the episode's waveform: amplitude bars, the played
 * part in the tone and the rest muted, with a playhead line and optional
 * elapsed / remaining times. Tapping or dragging the bars seeks.
 *
 * A controlled UI component with no audio engine — the app owns playback,
 * passes `position` and `duration` in seconds and seeks its player in
 * `onSeek`. While a drag is in progress the bar previews the finger's
 * position (and reports it through `onScrub`), then hands the final second
 * to `onSeek` on release. Drag input goes through
 * react-native-gesture-handler, which every Mapples app ships.
 *
 * @example
 * ```tsx
 * <WaveformSeekBar
 *   samples={episode.waveform}
 *   position={player.position}
 *   duration={player.duration}
 *   onSeek={player.seekTo}
 *   showTimes
 * />
 * ```
 *
 * @public
 */
const WaveformSeekBar: ForwardRefExoticComponent<
  PropsWithChildren<WaveformSeekBarProps> &
    RefAttributes<ComponentRef<typeof View>>
> = forwardRef<
  ComponentRef<typeof View>,
  PropsWithChildren<WaveformSeekBarProps>
>(
  (
    {
      samples,
      position,
      duration,
      onSeek,
      onScrub,
      showTimes = false,
      height = WAVEFORM_SEEK_BAR_GEOMETRY.height,
      barWidth = WAVEFORM_SEEK_BAR_GEOMETRY.barWidth,
      barGap = WAVEFORM_SEEK_BAR_GEOMETRY.barGap,
      accessibilityStepSeconds = WAVEFORM_SEEK_BAR_ACCESSIBILITY_STEP,
      tone = 'primary',
      disabled = false,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    if (samples === undefined || samples.length === 0) {
      throw new Error('WaveformSeekBar: samples must be a non-empty array');
    }
    samples.forEach((sample, index) => {
      if (typeof sample !== 'number' || !(sample >= 0 && sample <= 1)) {
        throw new Error(
          `WaveformSeekBar: samples[${index}] must be a number in 0..1 (got ${sample})`,
        );
      }
    });
    if (duration === undefined) {
      throw new Error('WaveformSeekBar: duration is required');
    }
    assertPositiveNumber('duration', duration);
    if (position === undefined) {
      throw new Error('WaveformSeekBar: position is required');
    }
    if (!Number.isFinite(position) || position < 0 || position > duration) {
      throw new Error(
        `WaveformSeekBar: position must be within 0..duration (${duration}), got ${position}`,
      );
    }
    assertPositiveNumber('height', height);
    assertPositiveNumber('barWidth', barWidth);
    assertPositiveNumber('accessibilityStepSeconds', accessibilityStepSeconds);
    if (!Number.isFinite(barGap) || barGap < 0) {
      throw new Error(
        `WaveformSeekBar: barGap must be a number ≥ 0 (got ${barGap})`,
      );
    }

    const tones = useTones();
    const palette = tones.tone(tone);
    const [width, setWidth] = useState(0);
    const [scrub, setScrub] = useState<number | null>(null);
    // The gesture's finalize callback reads the latest scrub, not the render's.
    const scrubRef = useRef<number | null>(null);

    const barColor = useSlotColor(
      styled?.styleBar,
      'backgroundColor',
      tones.outlineStrong,
    );
    const playedColor = useSlotColor(
      styled?.styleBarPlayed,
      'backgroundColor',
      palette.main,
    );
    const playheadColor = useSlotColor(
      styled?.stylePlayhead,
      'backgroundColor',
      palette.main,
    );

    const bars = useMemo(() => {
      if (width <= 0) return [];
      const fit = Math.max(
        1,
        Math.floor((width + barGap) / (barWidth + barGap)),
      );
      return resample(samples, fit);
    }, [barGap, barWidth, samples, width]);

    const shown = scrub ?? position;
    const fraction = shown / duration;

    const secondsFromX = useCallback(
      (x: number) => clamp(x / width, 0, 1) * duration,
      [duration, width],
    );

    const moveScrub = (x: number) => {
      const seconds = secondsFromX(x);
      scrubRef.current = seconds;
      setScrub(seconds);
      onScrub?.(seconds);
    };

    const pan = Gesture.Pan()
      .enabled(!disabled && width > 0)
      .minDistance(0)
      .runOnJS(true)
      .onBegin((event) => moveScrub(event.x))
      .onUpdate((event) => moveScrub(event.x))
      .onFinalize(() => {
        const target = scrubRef.current;
        scrubRef.current = null;
        setScrub(null);
        if (target !== null) onSeek?.(target);
      });

    const onLayout = (event: LayoutChangeEvent) =>
      setWidth(event.nativeEvent.layout.width);

    const onAccessibilityAction = (event: AccessibilityActionEvent) => {
      if (disabled) return;
      const direction = event.nativeEvent.actionName === 'increment' ? 1 : -1;
      onSeek?.(
        clamp(position + direction * accessibilityStepSeconds, 0, duration),
      );
    };

    const withHours = duration >= 3600;
    const elapsedText = formatPlaybackTime(shown, withHours);
    const remainingText = `-${formatPlaybackTime(
      Math.ceil(duration - shown),
      withHours,
    )}`;
    const durationText = formatPlaybackTime(duration, withHours);
    const timeColor = tones.resolve(Tokens.color.textSecondary);
    const { minBarHeight, playhead } = WAVEFORM_SEEK_BAR_GEOMETRY;

    return (
      <StyledView
        ref={ref}
        styled={{
          style: [
            defaults.root,
            styled?.style,
            disabled && { opacity: DISABLED_OPACITY },
          ],
        }}
        {...rest}
      >
        <GestureDetector gesture={pan}>
          <StyledView
            accessibilityRole="adjustable"
            accessibilityLabel="Seek"
            accessibilityValue={{
              min: 0,
              max: Math.round(duration),
              now: Math.floor(shown),
              text: `${elapsedText} of ${durationText}`,
            }}
            accessibilityActions={[
              { name: 'increment' },
              { name: 'decrement' },
            ]}
            accessibilityState={{ disabled }}
            onAccessibilityAction={onAccessibilityAction}
            onLayout={onLayout}
            styled={{ style: [defaults.bars, { height }, styled?.styleBars] }}
          >
            {bars.map((sample, index) => {
              const played = (index + 0.5) / bars.length <= fraction;
              return (
                <StyledView
                  key={index}
                  pointerEvents="none"
                  styled={{
                    style: [
                      {
                        width: barWidth,
                        height: Math.max(minBarHeight, sample * height),
                        borderRadius: barWidth / 2,
                        backgroundColor: played ? playedColor : barColor,
                      },
                      played ? styled?.styleBarPlayed : styled?.styleBar,
                    ],
                  }}
                />
              );
            })}
            {width > 0 ? (
              <StyledView
                pointerEvents="none"
                styled={{
                  style: [
                    defaults.playhead,
                    {
                      width: playhead,
                      borderRadius: playhead / 2,
                      left: clamp(
                        fraction * width - playhead / 2,
                        0,
                        width - playhead,
                      ),
                      backgroundColor: playheadColor,
                    },
                    styled?.stylePlayhead,
                  ],
                }}
              />
            ) : null}
          </StyledView>
        </GestureDetector>
        {showTimes ? (
          <StyledView styled={{ style: defaults.times }}>
            {[elapsedText, remainingText].map((text, index) => (
              <Typography
                key={index}
                variant={TYPOGRAPHY_PARTS.helper}
                style={[defaults.time, { color: timeColor }, styled?.styleTime]}
              >
                {text}
              </Typography>
            ))}
          </StyledView>
        ) : null}
      </StyledView>
    );
  },
);
WaveformSeekBar.displayName = 'WaveformSeekBar';

export default WaveformSeekBar;
