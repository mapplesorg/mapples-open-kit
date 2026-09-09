import { forwardRef, PropsWithChildren } from 'react';

import { StyledProp, StyledView, useStyled } from '@mapples/style';
import { RADII, useTones } from '@mapples/ui';
import {
  Animated,
  DimensionValue,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import { useLoopValue, useSlotColor } from '../../../internal';

import { defaults } from './defaults';
import {
  SKELETON_CIRCLE_EDGE,
  SKELETON_HEIGHT,
  SKELETON_LAST_LINE,
  SkeletonVariant,
} from './types';

/** Props for {@link Skeleton}. */
export interface SkeletonProps extends Omit<ViewProps, 'children'> {
  /** Shape: stacked text lines, a block, or a circle. Defaults to `rect`. */
  variant?: SkeletonVariant;
  /** Width in points or a percentage. Defaults to `'100%'` (a circle: `40`). */
  width?: DimensionValue;
  /** Height in points. Defaults to `16` per text line, `80` for a block; a circle takes its width. */
  height?: number;
  /** Number of text lines (`text` only); the last is 60% wide. Defaults to `1`. */
  lines?: number;
  /** Corner radius in points. Defaults to `8`; a circle is round. */
  radius?: number;
  /** Pulses the opacity while shown. Defaults to `true`. */
  animated?: boolean;
  /** Space between text lines in points. Defaults to `8`. */
  gap?: number;
  /** Styled slots for every visual part. */
  styled?: {
    /** The block (or the column of lines). */
    style?: StyledProp<ViewStyle>;
    /** Every line/shape (its `backgroundColor` is the placeholder colour). */
    styleLine?: StyledProp<ViewStyle>;
  };
}

/**
 * A pulsing placeholder standing in for content that is still loading — a
 * paragraph of lines, a block, or a circle. The colour derives from the text
 * colour so it reads on light and dark surfaces alike; the pulse stops when
 * `animated` is off or the OS reduces motion.
 *
 * @example
 * ```tsx
 * <Skeleton variant="circle" width={48} />
 * <Skeleton variant="text" lines={3} />
 * <Skeleton height={160} />
 * ```
 *
 * @public
 */
const Skeleton = forwardRef<View, PropsWithChildren<SkeletonProps>>(
  (
    {
      variant = 'rect',
      width,
      height,
      lines = 1,
      radius,
      animated = true,
      gap = 8,
      accessibilityLabel = 'Loading',
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const isCircle = variant === 'circle';
    const isText = variant === 'text';
    const resolvedWidth: DimensionValue =
      width ?? (isCircle ? SKELETON_CIRCLE_EDGE : '100%');
    let circleEdge = 0;
    if (isCircle) {
      if (typeof resolvedWidth !== 'number') {
        throw new Error(
          `Skeleton: a circle needs a numeric width, got ${String(resolvedWidth)}`,
        );
      }
      circleEdge = resolvedWidth;
    }
    if (!Number.isInteger(lines) || lines < 1) {
      throw new Error(`Skeleton: lines (${lines}) must be a positive integer`);
    }
    const resolvedHeight =
      height ??
      (isCircle
        ? circleEdge
        : isText
          ? SKELETON_HEIGHT.text
          : SKELETON_HEIGHT.rect);
    const cornerRadius = radius ?? (isCircle ? circleEdge / 2 : RADII.sm);
    const count = isText ? lines : 1;

    const tones = useTones();
    const color = useSlotColor(
      styled?.styleLine,
      'backgroundColor',
      tones.fillStrong,
    );
    const resolved = useStyled({ line: styled?.styleLine }) as {
      line?: ViewStyle;
    };
    const opacity = useLoopValue({
      from: 0.5,
      to: 1,
      duration: 800,
      running: animated,
    });

    return (
      <StyledView
        ref={ref}
        accessibilityRole="none"
        accessibilityLabel={accessibilityLabel}
        styled={{
          style: [defaults.root, { width: resolvedWidth, gap }, styled?.style],
        }}
        {...rest}
      >
        {Array.from({ length: count }, (_, index) => (
          <Animated.View
            key={index}
            pointerEvents="none"
            style={[
              {
                width:
                  isText && count > 1 && index === count - 1
                    ? `${SKELETON_LAST_LINE * 100}%`
                    : '100%',
                height: resolvedHeight,
                borderRadius: cornerRadius,
                backgroundColor: color,
              },
              resolved.line,
              { opacity },
            ]}
          />
        ))}
      </StyledView>
    );
  },
);
Skeleton.displayName = 'Skeleton';

export default Skeleton;
