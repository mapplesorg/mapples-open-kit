import {
  forwardRef,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView, Typography } from '@mapples/style';
import { Tokens, Tone, TYPOGRAPHY_PARTS, useTones } from '@mapples/ui';
import {
  AccessibilityInfo,
  Platform,
  Text,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useSlotColor } from '../../../internal';
import { circleGeometry } from '../ProgressCircle/types';

import { defaults } from './defaults';
import {
  COUNTDOWN_TIMER_DEFAULTS,
  COUNTDOWN_TIMER_FORMATS,
  COUNTDOWN_TIMER_VARIANTS,
  countdownRemaining,
  countdownSeconds,
  CountdownTimerFormat,
  CountdownTimerVariant,
  formatCountdown,
  readCountdownSource,
  spokenCountdown,
} from './types';

/** Props for {@link CountdownTimer}. */
export interface CountdownTimerProps extends Omit<ViewProps, 'children'> {
  /** Length of the countdown in seconds (a rest timer's 84). Give this or `endsAt`, never both. */
  durationSeconds?: number;
  /** ISO timestamp the countdown ends at ('2026-10-22T18:30:00Z'). Give this or `durationSeconds`, never both. */
  endsAt?: string;
  /** Counts down while `true`; `false` freezes the current value (a duration resumes where it stopped). Defaults to `true`. */
  running?: boolean;
  /** `auto` (`mm:ss`, `h:mm:ss` from an hour up), `mm:ss` (minutes past 59 keep counting) or `hh:mm:ss`. Defaults to `auto`. */
  format?: CountdownTimerFormat;
  /** Fires once when a running countdown reaches zero. */
  onEnd?: () => void;
  /** Bare digits, or digits centred in a ring that drains as time passes. Defaults to `text`. */
  variant?: CountdownTimerVariant;
  /** Digit font size (`text`, default `40`) or the ring's edge in points (`ring`, default `120`). */
  size?: number;
  /** Colour role of the ring, and of the digits of the `text` variant. Omitted, the digits take the text colour and the ring `primary`. */
  tone?: Tone;
  /** What screen readers announce when the countdown reaches zero. Defaults to "Time is up". */
  endMessage?: string;
  /** Screen-reader name. Defaults to the time left, e.g. "1 minute 24 seconds left". */
  accessibilityLabel?: string;
  /** Styled slots for every visual part. */
  styled?: {
    /** The box around the timer. */
    style?: StyledProp<ViewStyle>;
    /** The digits. */
    styleDigits?: StyledProp<TextStyle>;
    /** The draining arc of the `ring` variant (its `color` is the stroke colour). */
    styleRing?: StyledProp<ViewStyle & { color?: string }>;
  };
}

/**
 * A live countdown — a fitness rest timer, an offer that ends tonight. Counts
 * a `durationSeconds` or down to an `endsAt` timestamp in tabular digits,
 * optionally centred in a ring that drains as time passes. The display
 * updates on each whole second through a timer that is cleared on pause and
 * unmount. Screen readers read the time left on focus and hear `endMessage`
 * once at the end, never every second.
 *
 * @example
 * ```tsx
 * <CountdownTimer durationSeconds={84} variant="ring" onEnd={nextSet} />
 * <CountdownTimer endsAt="2026-10-22T18:30:00Z" format="hh:mm:ss" />
 * ```
 *
 * @public
 */
const CountdownTimer: ForwardRefExoticComponent<
  PropsWithChildren<CountdownTimerProps> &
    RefAttributes<ComponentRef<typeof View>>
> = forwardRef<
  ComponentRef<typeof View>,
  PropsWithChildren<CountdownTimerProps>
>(
  (
    {
      durationSeconds,
      endsAt,
      running = true,
      format = 'auto',
      onEnd,
      variant = 'text',
      size,
      tone,
      endMessage = COUNTDOWN_TIMER_DEFAULTS.endMessage,
      accessibilityLabel,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const source = readCountdownSource(durationSeconds, endsAt);
    const { durationMs, endsAtMs } = source;
    if (!COUNTDOWN_TIMER_FORMATS.includes(format)) {
      throw new Error(
        `CountdownTimer: format (${String(format)}) must be one of ${COUNTDOWN_TIMER_FORMATS.join(', ')}`,
      );
    }
    if (!COUNTDOWN_TIMER_VARIANTS.includes(variant)) {
      throw new Error(
        `CountdownTimer: variant (${String(variant)}) must be one of ${COUNTDOWN_TIMER_VARIANTS.join(', ')}`,
      );
    }
    if (size !== undefined && !(size > 0)) {
      throw new Error(`CountdownTimer: size (${size}) must be positive`);
    }

    const tones = useTones();
    const palette = tones.tone(tone ?? 'primary');
    const trackColor = tones.fill;
    const arcColor = useSlotColor(styled?.styleRing, 'color', palette.main);

    const [remainingMs, setRemainingMs] = useState(() =>
      countdownRemaining(source, Date.now()),
    );
    const [totalMs, setTotalMs] = useState(() =>
      countdownRemaining(source, Date.now()),
    );
    // Mirrors `remainingMs` synchronously so the ticking effect starts from
    // the value the reset effect just set, in the same commit.
    const remainingRef = useRef(remainingMs);
    const update = useCallback((next: number) => {
      remainingRef.current = next;
      setRemainingMs(next);
    }, []);
    // The latest end handler and message, read when the countdown ends
    // without restarting the ticking effect on every parent render.
    const onEndRef = useRef(onEnd);
    const endMessageRef = useRef(endMessage);
    useEffect(() => {
      onEndRef.current = onEnd;
      endMessageRef.current = endMessage;
    }, [onEnd, endMessage]);

    // A new duration or end time restarts the countdown.
    useEffect(() => {
      const start = countdownRemaining({ durationMs, endsAtMs }, Date.now());
      update(start);
      setTotalMs(start);
    }, [durationMs, endsAtMs, update]);

    useEffect(() => {
      if (!running || remainingRef.current <= 0) return undefined;
      const deadline = endsAtMs ?? Date.now() + remainingRef.current;
      let timer: ReturnType<typeof setTimeout> | undefined;
      // Wake on each whole-second boundary of the deadline, so the digits
      // change on time without re-rendering more than once a second.
      const delay = () => Math.max(0, deadline - Date.now()) % 1000 || 1000;
      const tick = () => {
        const left = Math.max(0, deadline - Date.now());
        update(left);
        if (left > 0) {
          timer = setTimeout(tick, delay());
          return;
        }
        timer = undefined;
        // Android and web read the live region below; iOS needs the call.
        if (Platform.OS === 'ios') {
          AccessibilityInfo.announceForAccessibility(endMessageRef.current);
        }
        onEndRef.current?.();
      };
      timer = setTimeout(tick, delay());
      return () => {
        if (timer === undefined) return;
        clearTimeout(timer);
        // Keep the exact time left, so a paused duration resumes precisely.
        if (endsAtMs === undefined) {
          remainingRef.current = Math.max(0, deadline - Date.now());
        }
      };
    }, [running, durationMs, endsAtMs, update]);

    const seconds = countdownSeconds(remainingMs);
    const digits = formatCountdown(seconds, format);
    const finished = remainingMs <= 0;
    const digitColor = tone ? palette.ink : tones.resolve(Tokens.color.text);
    const ring = variant === 'ring';
    const edge =
      size ??
      (ring
        ? COUNTDOWN_TIMER_DEFAULTS.ringSize
        : COUNTDOWN_TIMER_DEFAULTS.textSize);
    // In the ring the digits fit the inner circle: tabular digits are about
    // 0.6em wide, and the line must stay inside ~70 % of the edge.
    const fontSize = ring
      ? Math.round(Math.min(edge * 0.26, (edge * 0.68) / (digits.length * 0.6)))
      : edge;

    const label = (
      <Typography
        variant={TYPOGRAPHY_PARTS.headline}
        numberOfLines={1}
        style={[
          defaults.digits,
          {
            color: digitColor,
            fontSize,
            lineHeight: Math.round(fontSize * 1.2),
          },
          styled?.styleDigits,
        ]}
      >
        {digits}
      </Typography>
    );

    let body = label;
    if (ring) {
      const strokeWidth = Math.max(3, Math.round(edge / 15));
      const { radius, circumference, arc, rotation } = circleGeometry(
        edge,
        strokeWidth,
        'ring',
      );
      const fraction = totalMs > 0 ? Math.min(1, remainingMs / totalMs) : 0;
      const centre = edge / 2;
      body = (
        <StyledView
          styled={{ style: [defaults.dial, { width: edge, height: edge }] }}
        >
          <Svg
            width={edge}
            height={edge}
            viewBox={`0 0 ${edge} ${edge}`}
            pointerEvents="none"
            style={{ transform: [{ rotate: `${rotation}deg` }] }}
          >
            <Circle
              cx={centre}
              cy={centre}
              r={radius}
              fill="none"
              stroke={trackColor}
              strokeWidth={strokeWidth}
            />
            <Circle
              cx={centre}
              cy={centre}
              r={radius}
              fill="none"
              stroke={arcColor}
              strokeWidth={strokeWidth}
              strokeLinecap={fraction > 0 ? 'round' : 'butt'}
              strokeDasharray={[arc, circumference]}
              strokeDashoffset={arc * (1 - fraction)}
            />
          </Svg>
          <StyledView pointerEvents="none" styled={{ style: defaults.centre }}>
            {label}
          </StyledView>
        </StyledView>
      );
    }

    return (
      <StyledView
        ref={ref}
        styled={{ style: [defaults.root, styled?.style] }}
        {...rest}
      >
        <View
          accessible
          accessibilityRole="timer"
          accessibilityLabel={accessibilityLabel ?? spokenCountdown(seconds)}
        >
          {body}
        </View>
        <Text accessibilityLiveRegion="polite" style={defaults.announcer}>
          {finished ? endMessage : ''}
        </Text>
      </StyledView>
    );
  },
);
CountdownTimer.displayName = 'CountdownTimer';

export default CountdownTimer;
