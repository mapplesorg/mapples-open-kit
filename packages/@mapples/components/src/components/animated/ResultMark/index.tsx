import {
  forwardRef,
  PropsWithChildren,
  useEffect,
  useState,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView } from '@mapples/style';
import { useTones } from '@mapples/ui';
import { View, ViewProps, ViewStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { useReduceMotion, useSlotColor } from '../../../internal';

import {
  RESULT_MARK_BOX,
  RESULT_MARK_DURATION,
  RESULT_MARK_GLYPHS,
  RESULT_MARK_LABELS,
  RESULT_MARK_RADIUS,
  RESULT_MARK_RING_LENGTH,
  RESULT_MARK_RING_PATH,
  RESULT_MARK_STATUSES,
  ResultMarkStatus,
} from './types';

/** Props for {@link ResultMark}. */
export interface ResultMarkProps extends Omit<ViewProps, 'children'> {
  /** What the mark says. Defaults to `success`. */
  status?: ResultMarkStatus;
  /** Edge of the mark in points. Defaults to `64`. */
  size?: number;
  /** Fills the ring with a soft tint of the status colour. Defaults to `true`. */
  filled?: boolean;
  /** Styled slots. */
  styled?: {
    /** The box around the mark (its `color` repaints the ring and the glyph). */
    style?: StyledProp<ViewStyle & { color?: string }>;
  };
}

/**
 * The outcome of something the user just did, drawn in: a ring closes and a
 * tick, cross, exclamation mark or "i" is written inside it. For the screen
 * after a payment, a sent form, a failed upload — the moment the result
 * should be felt, not just read. It draws when it appears and again when
 * `status` changes. With reduced motion the finished mark is simply shown.
 *
 * @example
 * ```tsx
 * <ResultMark status="success" size={96} />
 * ```
 *
 * @public
 */
const ResultMark: ForwardRefExoticComponent<
  PropsWithChildren<ResultMarkProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<ResultMarkProps>>(
  (
    {
      status = 'success',
      size = 64,
      filled = true,
      accessibilityLabel,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    if (!RESULT_MARK_STATUSES.includes(status)) {
      throw new Error(
        `ResultMark: status (${String(status)}) must be one of ${RESULT_MARK_STATUSES.join(', ')}`,
      );
    }
    if (!(size > 0)) {
      throw new Error(`ResultMark: size (${size}) must be positive`);
    }

    const tones = useTones();
    const reduceMotion = useReduceMotion();
    const glyph = RESULT_MARK_GLYPHS[status];
    const palette = tones.tone(glyph.tone);
    const color = useSlotColor(styled?.style, 'color', palette.main);
    // 0: nothing drawn; 1: ring closed and glyph written. Stepped in React
    // state: an SVG stroke is not something an animated style can drive on
    // every platform, and the mark is a handful of paths.
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      if (reduceMotion) return undefined;

      let frame = 0;
      let startedAt: number | null = null;
      const step = (now: number) => {
        startedAt ??= now;
        const elapsed = Math.min(1, (now - startedAt) / RESULT_MARK_DURATION);
        // Eases out: quick to start, settling as the glyph ends.
        setProgress(1 - Math.pow(1 - elapsed, 3));
        if (elapsed < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);

      return () => cancelAnimationFrame(frame);
      // Draws again for a new status.
    }, [reduceMotion, status]);

    // The ring closes over the first 60%, the glyph is written over the
    // last 50%: they overlap a little, so the mark reads as one gesture.
    const drawn = reduceMotion ? 1 : progress;
    const ringOffset = RESULT_MARK_RING_LENGTH * (1 - Math.min(1, drawn / 0.6));
    const glyphOffset =
      glyph.length * (1 - Math.min(1, Math.max(0, (drawn - 0.5) / 0.5)));
    const centre = RESULT_MARK_BOX / 2;

    return (
      <StyledView
        ref={ref}
        accessible
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel ?? RESULT_MARK_LABELS[status]}
        styled={{
          style: [
            { width: size, height: size, alignSelf: 'flex-start' },
            styled?.style,
          ],
        }}
        {...rest}
      >
        <Svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${RESULT_MARK_BOX} ${RESULT_MARK_BOX}`}
        >
          {filled ? (
            <Circle
              cx={centre}
              cy={centre}
              r={RESULT_MARK_RADIUS}
              fill={color}
              fillOpacity={0.12}
            />
          ) : null}
          <Path
            d={RESULT_MARK_RING_PATH}
            fill="none"
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={RESULT_MARK_RING_LENGTH}
            strokeDashoffset={ringOffset}
          />
          {glyph.paths.map((path) => (
            <Path
              key={path}
              d={path}
              fill="none"
              stroke={color}
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={glyph.length}
              strokeDashoffset={glyphOffset}
            />
          ))}
        </Svg>
      </StyledView>
    );
  },
);
ResultMark.displayName = 'ResultMark';

export default ResultMark;
