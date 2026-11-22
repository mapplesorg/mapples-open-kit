import {
  forwardRef,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView, Typography } from '@mapples/style';
import { Tokens, TYPOGRAPHY_PARTS, useTones } from '@mapples/ui';
import { TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import { useReduceMotion } from '../../../internal';

import {
  ANIMATED_NUMBER_DURATION,
  animatedNumberAt,
  formatAnimatedNumber,
} from './types';

/** Props for {@link AnimatedNumber}. */
export interface AnimatedNumberProps extends Omit<ViewProps, 'children'> {
  /** The number to show. Absent (a bound request that has not answered) counts as `from`. */
  value?: number;
  /** Where the first count starts. Defaults to `0`. */
  from?: number;
  /** Length of a count in ms. Defaults to `800`. */
  duration?: number;
  /** Fraction digits. Defaults to `0`. */
  decimals?: number;
  /** Thousands separators. Defaults to `true`. */
  grouping?: boolean;
  /** Text before the number ('$'). */
  prefix?: string;
  /** Text after the number ('%', ' pts'). */
  suffix?: string;
  /** Typography variant of the number. Defaults to the headline variant. */
  typographyVariant?: string;
  /** Styled slots. */
  styled?: {
    /** The box around the number. */
    style?: StyledProp<ViewStyle>;
    /** The number text. */
    styleValue?: StyledProp<TextStyle>;
  };
}

/**
 * A number that counts to its value: from `from` when it appears, and from
 * the value it showed whenever `value` changes — a balance, a score, a KPI
 * on a dashboard. The count eases out, so the last digits settle instead of
 * snapping. Screen readers get the final value at once. With reduced motion
 * the value is simply shown.
 *
 * @example
 * ```tsx
 * <AnimatedNumber value={balance} prefix="$" decimals={2} />
 * ```
 *
 * @public
 */
const AnimatedNumber: ForwardRefExoticComponent<
  PropsWithChildren<AnimatedNumberProps> &
    RefAttributes<ComponentRef<typeof View>>
> = forwardRef<
  ComponentRef<typeof View>,
  PropsWithChildren<AnimatedNumberProps>
>(
  (
    {
      value,
      from = 0,
      duration = ANIMATED_NUMBER_DURATION,
      decimals = 0,
      grouping = true,
      prefix = '',
      suffix = '',
      typographyVariant,
      accessibilityLabel,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    if (
      value != null &&
      (typeof value !== 'number' || !Number.isFinite(value))
    ) {
      throw new Error(
        `AnimatedNumber: value (${String(value)}) must be a finite number`,
      );
    }
    if (!Number.isInteger(decimals) || decimals < 0) {
      throw new Error(
        `AnimatedNumber: decimals (${decimals}) must be a whole number of at least 0`,
      );
    }
    if (!(duration >= 0)) {
      throw new Error(
        `AnimatedNumber: duration (${duration}) must be at least 0`,
      );
    }

    const tones = useTones();
    const reduceMotion = useReduceMotion();
    const target = value ?? from;
    const [shown, setShown] = useState(from);
    // Where the next count starts: the number on screen, even mid-count.
    const shownRef = useRef(from);

    useEffect(() => {
      const start = shownRef.current;
      const show = (next: number) => {
        shownRef.current = next;
        setShown(next);
      };

      if (reduceMotion || duration === 0 || start === target) {
        show(target);
        return undefined;
      }

      let frame = 0;
      let startedAt: number | null = null;
      const step = (now: number) => {
        startedAt ??= now;
        const progress = Math.min(1, (now - startedAt) / duration);
        show(animatedNumberAt(start, target, progress));
        if (progress < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);

      return () => cancelAnimationFrame(frame);
    }, [duration, reduceMotion, target]);

    return (
      <StyledView
        ref={ref}
        accessible
        accessibilityRole="text"
        accessibilityLabel={
          accessibilityLabel ??
          formatAnimatedNumber(target, decimals, grouping, prefix, suffix)
        }
        styled={{ style: [{ alignSelf: 'flex-start' }, styled?.style] }}
        {...rest}
      >
        <Typography
          variant={typographyVariant ?? TYPOGRAPHY_PARTS.headline}
          numberOfLines={1}
          style={[
            // Digits of equal width, so the number does not jitter as it counts.
            { fontVariant: ['tabular-nums'] },
            { color: tones.resolve(Tokens.color.text) },
            styled?.styleValue,
          ]}
        >
          {formatAnimatedNumber(shown, decimals, grouping, prefix, suffix)}
        </Typography>
      </StyledView>
    );
  },
);
AnimatedNumber.displayName = 'AnimatedNumber';

export default AnimatedNumber;
