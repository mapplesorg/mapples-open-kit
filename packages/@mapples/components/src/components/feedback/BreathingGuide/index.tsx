import {
  forwardRef,
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView, Typography } from '@mapples/style';
import {
  Tokens,
  Tone,
  TYPOGRAPHY_PARTS,
  useShape,
  useTones,
} from '@mapples/ui';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import { NATIVE_DRIVER, useReduceMotion } from '../../../internal';

import { defaults } from './defaults';
import {
  BREATHING_GUIDE_CENTRE,
  BREATHING_GUIDE_DEFAULT_PATTERN,
  BREATHING_GUIDE_DEFAULTS,
  BREATHING_GUIDE_RINGS,
  BreathingPhase,
  breathingCount,
  breathingLevels,
  readBreathingPattern,
} from './types';

/** Props for {@link BreathingGuide}. */
export interface BreathingGuideProps extends Omit<ViewProps, 'children'> {
  /** The phases of one breath, repeated: `[{ label, seconds, kind: 'inhale' | 'hold' | 'exhale' }]` (1–8). Defaults to 4-7-8 (in 4, hold 7, out 8). */
  pattern?: readonly BreathingPhase[];
  /** Whether the guide runs. While `false` it shows a still frame of the first phase; turning it off resets to the first phase. Defaults to `false`. */
  running?: boolean;
  /** Edge of the ring dial in points. Defaults to `240`. */
  size?: number;
  /** Shows a row of phase pills ("Inhale · 4") under the dial, the current one highlighted. Defaults to `true`. */
  showLegend?: boolean;
  /** Colour role of the rings, centre and current pill. Defaults to `primary`. */
  tone?: Tone;
  /** Fires with the pattern index whenever a phase starts while running. */
  onPhaseChange?: (index: number) => void;
  /** Fires each time the last phase ends and the pattern starts over. */
  onCycleComplete?: () => void;
  /** Styled slots for every visual part. */
  styled?: {
    /** The box around the dial and legend. */
    style?: StyledProp<ViewStyle>;
    /** Every soft ring (`backgroundColor`, `opacity`). */
    styleRing?: StyledProp<ViewStyle>;
    /** The solid centre disc. */
    styleCentre?: StyledProp<ViewStyle>;
    /** The seconds count in the centre. */
    styleCount?: StyledProp<TextStyle>;
    /** The phase label in the centre. */
    styleLabel?: StyledProp<TextStyle>;
    /** The legend row. */
    styleLegend?: StyledProp<ViewStyle>;
    /** Every legend pill. */
    stylePill?: StyledProp<ViewStyle>;
    /** The current phase's legend pill. */
    stylePillActive?: StyledProp<ViewStyle>;
    /** Every legend pill's text. */
    stylePillLabel?: StyledProp<TextStyle>;
    /** The current phase's legend pill text. */
    stylePillLabelActive?: StyledProp<TextStyle>;
  };
}

/** Where the guide is: the session it belongs to, the phase step and the whole seconds elapsed in it. */
interface BreathingClock {
  session: string;
  step: number;
  elapsed: number;
}

/**
 * A paced-breathing guide for meditation and calm screens: soft concentric
 * rings grow while breathing in, rest while holding and shrink while
 * breathing out, with the seconds left and the phase label in the centre and
 * an optional legend of the pattern ("Inhale · 4  Hold · 7  Exhale · 8").
 * Screen readers hear each phase change once (not every second).
 *
 * @example
 * ```tsx
 * <BreathingGuide running={active} onCycleComplete={() => setCycles((n) => n + 1)} />
 * <BreathingGuide
 *   pattern={[
 *     { label: 'In', seconds: 4, kind: 'inhale' },
 *     { label: 'Hold', seconds: 4, kind: 'hold' },
 *     { label: 'Out', seconds: 4, kind: 'exhale' },
 *     { label: 'Hold', seconds: 4, kind: 'hold' },
 *   ]}
 *   running
 *   tone="accent"
 * />
 * ```
 *
 * @public
 */
const BreathingGuide: ForwardRefExoticComponent<
  PropsWithChildren<BreathingGuideProps> &
    RefAttributes<ComponentRef<typeof View>>
> = forwardRef<
  ComponentRef<typeof View>,
  PropsWithChildren<BreathingGuideProps>
>(
  (
    {
      pattern = BREATHING_GUIDE_DEFAULT_PATTERN,
      running = false,
      size = BREATHING_GUIDE_DEFAULTS.size,
      showLegend = true,
      tone = 'primary',
      onPhaseChange,
      onCycleComplete,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const component = 'BreathingGuide';
    if (!(size > 0)) {
      throw new Error(`${component}: size (${String(size)}) must be positive`);
    }
    // A new array with the same phases (every canvas render) keeps the clock.
    const signature = JSON.stringify(readBreathingPattern(pattern, component));
    const phases = useMemo(
      () => JSON.parse(signature) as BreathingPhase[],
      [signature],
    );
    const levels = useMemo(() => breathingLevels(phases), [phases]);

    const tones = useTones();
    const shape = useShape();
    const palette = tones.tone(tone);
    const reduceMotion = useReduceMotion();

    // Starting, stopping or a new pattern opens a new session at phase 0.
    const session = `${running ? 'on' : 'off'}|${signature}`;
    const [clock, setClock] = useState<BreathingClock>({
      session,
      step: 0,
      elapsed: 0,
    });
    const step = clock.session === session ? clock.step : 0;
    const elapsed = clock.session === session ? clock.elapsed : 0;
    const index = step % phases.length;
    const phase = phases[index];
    const count = breathingCount(phase.seconds - elapsed);

    const [level] = useState(() => new Animated.Value(levels[0].from));
    const scales = useMemo(
      () =>
        BREATHING_GUIDE_RINGS.map((ring) =>
          level.interpolate({
            inputRange: [0, 1],
            outputRange: [ring.minScale, 1],
          }),
        ),
      [level],
    );
    const callbacks = useRef({ onPhaseChange, onCycleComplete });
    useEffect(() => {
      callbacks.current = { onPhaseChange, onCycleComplete };
    });

    useEffect(() => {
      const current = phases[step % phases.length];
      const { from, to } = levels[step % phases.length];
      if (!running) {
        level.setValue(from);
        return;
      }
      const duration = current.seconds * 1000;
      level.setValue(from);
      const animation = reduceMotion
        ? null
        : Animated.timing(level, {
            toValue: to,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: NATIVE_DRIVER,
          });
      if (animation) animation.start();
      else level.setValue(to);

      callbacks.current.onPhaseChange?.(step % phases.length);
      AccessibilityInfo.announceForAccessibility(
        `${current.label}, ${breathingCount(current.seconds)} seconds`,
      );

      const tick = setInterval(() => {
        setClock((previous) => ({
          session,
          step,
          elapsed:
            (previous.session === session && previous.step === step
              ? previous.elapsed
              : 0) + 1,
        }));
      }, 1000);
      const advance = setTimeout(() => {
        if (step % phases.length === phases.length - 1) {
          callbacks.current.onCycleComplete?.();
        }
        setClock({ session, step: step + 1, elapsed: 0 });
      }, duration);

      return () => {
        animation?.stop();
        clearInterval(tick);
        clearTimeout(advance);
      };
    }, [level, levels, phases, reduceMotion, running, session, step]);

    const centre = Math.round(size * BREATHING_GUIDE_CENTRE);
    const contrast = palette.contrast;

    return (
      <StyledView
        ref={ref}
        styled={{ style: [defaults.root, styled?.style] }}
        {...rest}
      >
        <StyledView
          accessible
          accessibilityRole="timer"
          accessibilityLabel={`${phase.label}, ${count}`}
          styled={{ style: [defaults.dial, { width: size, height: size }] }}
        >
          {BREATHING_GUIDE_RINGS.map((ring, ringIndex) => {
            const diameter = size * ring.diameter;
            return (
              <Animated.View
                key={ringIndex}
                pointerEvents="none"
                style={[
                  defaults.ring,
                  {
                    width: diameter,
                    height: diameter,
                    left: (size - diameter) / 2,
                    top: (size - diameter) / 2,
                    transform: [{ scale: scales[ringIndex] }],
                  },
                ]}
              >
                <StyledView
                  styled={{
                    style: [
                      defaults.ringFill,
                      {
                        borderRadius: diameter / 2,
                        backgroundColor: palette.main,
                        opacity: ring.opacity,
                      },
                      styled?.styleRing,
                    ],
                  }}
                />
              </Animated.View>
            );
          })}
          <StyledView
            pointerEvents="none"
            styled={{
              style: [
                defaults.centre,
                {
                  width: centre,
                  height: centre,
                  borderRadius: centre / 2,
                  backgroundColor: palette.main,
                },
                styled?.styleCentre,
              ],
            }}
          >
            <Typography
              variant={TYPOGRAPHY_PARTS.headline}
              numberOfLines={1}
              style={[
                defaults.text,
                {
                  color: contrast,
                  fontSize: Math.round(centre * 0.34),
                  lineHeight: Math.round(centre * 0.4),
                },
                styled?.styleCount,
              ]}
            >
              {String(count)}
            </Typography>
            <Typography
              variant={TYPOGRAPHY_PARTS.label}
              numberOfLines={1}
              style={[
                defaults.text,
                { color: contrast, maxWidth: centre * 0.85 },
                styled?.styleLabel,
              ]}
            >
              {phase.label}
            </Typography>
          </StyledView>
        </StyledView>
        {showLegend ? (
          <StyledView
            styled={{
              style: [defaults.legend, { maxWidth: size }, styled?.styleLegend],
            }}
          >
            {phases.map((entry, phaseIndex) => {
              const active = phaseIndex === index;
              return (
                <StyledView
                  key={phaseIndex}
                  accessibilityState={{ selected: active }}
                  styled={{
                    style: [
                      defaults.pill,
                      {
                        borderRadius: shape.radius.pill,
                        backgroundColor: active
                          ? palette.container
                          : tones.fill,
                      },
                      styled?.stylePill,
                      active && styled?.stylePillActive,
                    ],
                  }}
                >
                  <Typography
                    variant={TYPOGRAPHY_PARTS.helper}
                    numberOfLines={1}
                    style={[
                      {
                        color: active
                          ? palette.onContainer
                          : tones.resolve(Tokens.color.textSecondary),
                      },
                      styled?.stylePillLabel,
                      active && styled?.stylePillLabelActive,
                    ]}
                  >
                    {`${entry.label} · ${entry.seconds}`}
                  </Typography>
                </StyledView>
              );
            })}
          </StyledView>
        ) : null}
      </StyledView>
    );
  },
);
BreathingGuide.displayName = 'BreathingGuide';

export default BreathingGuide;
