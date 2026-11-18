import {
  forwardRef,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import {
  StyledProp,
  StyledView,
  Styler,
  subscribeMotionCommands,
} from '@mapples/style';
import { useTones } from '@mapples/ui';
import { LayoutChangeEvent, View, ViewProps, ViewStyle } from 'react-native';

import { useReduceMotion } from '../../../internal';

import {
  CONFETTI_COUNT,
  CONFETTI_DURATION,
  CONFETTI_MAX_COUNT,
  confettiPieces,
} from './types';

/** Props for {@link Confetti}. */
export interface ConfettiProps extends Omit<ViewProps, 'children'> {
  /** How many pieces fall. Defaults to `24`; at most `80`. */
  count?: number;
  /**
   * The colours of the pieces, used in order. Defaults to the theme's
   * primary, accent, success, warning and info colours.
   */
  colors?: string[];
  /** How long the slowest piece takes to fall, in ms. Defaults to `2600`. */
  duration?: number;
  /** Falls when it appears. Defaults to `true`; off, it waits for a play command. */
  autoPlay?: boolean;
  /** Keeps falling instead of stopping after one burst. */
  loop?: boolean;
  /**
   * The name a `mapples:animation` action addresses it by: `play` drops a
   * new burst (a reward revealed by a button, a finished request).
   */
  name?: string;
  /** Fires when a burst has fallen (not while looping). */
  onComplete?: () => void;
  /** Styled slots for every visual part. */
  styled?: {
    /** The area the pieces fall through; fills its parent by default. */
    style?: StyledProp<ViewStyle>;
    /** Every piece (its size and colour are set per piece). */
    stylePiece?: StyledProp<ViewStyle>;
  };
}

/**
 * A burst of confetti over its parent: pieces of several sizes and colours
 * fall from the top, turning, each on its own delay and length, then are
 * gone. It lays itself over the parent (absolute fill) and never takes a
 * touch, so it goes last inside the screen or card it celebrates. It plays
 * when it appears, and again on a `mapples:animation` `play` addressed to
 * its `name`. With the OS's reduced-motion setting, or where motion is
 * turned off (a design canvas), nothing is drawn.
 *
 * @example
 * ```tsx
 * <Confetti name="reward" count={24} />
 * ```
 *
 * @public
 */
const Confetti: ForwardRefExoticComponent<
  PropsWithChildren<ConfettiProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<ConfettiProps>>(
  (
    {
      count = CONFETTI_COUNT,
      colors,
      duration = CONFETTI_DURATION,
      autoPlay = true,
      loop = false,
      name,
      onComplete,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    if (!Number.isInteger(count) || count < 1 || count > CONFETTI_MAX_COUNT) {
      throw new Error(
        `Confetti: count (${count}) must be a whole number from 1 to ${CONFETTI_MAX_COUNT}`,
      );
    }
    if (!(duration > 0)) {
      throw new Error(`Confetti: duration (${duration}) must be positive`);
    }
    if (colors !== undefined && (!Array.isArray(colors) || !colors.length)) {
      throw new Error(
        'Confetti: colors must be a list with at least one colour',
      );
    }

    const tones = useTones();
    const reduceMotion = useReduceMotion();
    const [height, setHeight] = useState(0);
    // Each burst is a number; 0 is "none yet".
    const [burst, setBurst] = useState(autoPlay ? 1 : 0);

    const palette = useMemo(
      () =>
        colors ?? [
          tones.tone('primary').main,
          tones.tone('accent').main,
          tones.tone('success').main,
          tones.tone('warning').main,
          tones.tone('info').main,
        ],
      [colors, tones],
    );
    const pieces = useMemo(
      () => confettiPieces(count, palette, duration),
      [count, palette, duration],
    );

    useEffect(() => {
      if (!name) return undefined;
      return subscribeMotionCommands((message) => {
        if (message.target !== name) return;
        if (message.command === 'play' || message.command === 'restart') {
          setBurst((current) => current + 1);
        }
      });
    }, [name]);

    const falling = burst > 0 && !reduceMotion && height > 0;
    // The last piece to land ends the burst.
    const total = Math.max(
      ...pieces.map((piece) => piece.delay + piece.duration),
    );

    useEffect(() => {
      if (!falling || loop) return undefined;
      const timer = setTimeout(() => {
        setBurst(0);
        onComplete?.();
      }, total);
      return () => clearTimeout(timer);
      // `onComplete` is read when the burst ends, not a reason to restart it.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [burst, falling, loop, total]);

    const onLayout = (event: LayoutChangeEvent) =>
      setHeight(event.nativeEvent.layout.height);

    return (
      <StyledView
        ref={ref}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        onLayout={onLayout}
        styled={{ style: [defaults.root, styled?.style] }}
        {...rest}
      >
        {falling
          ? pieces.map((piece, index) => (
              <StyledView
                // A new burst is new pieces, which start from the top again.
                key={`${burst}:${index}`}
                styled={{
                  style: [
                    defaults.piece,
                    {
                      left: `${Math.round(piece.x * 96)}%`,
                      width: piece.width,
                      height: piece.height,
                      backgroundColor: piece.color,
                      animationName: {
                        '0%': {
                          opacity: 0,
                          transform: [
                            { translateY: -piece.height * 2 },
                            { rotate: '0deg' },
                          ],
                        },
                        '10%': { opacity: 1 },
                        '100%': {
                          opacity: 0,
                          transform: [
                            { translateY: height + piece.height },
                            { rotate: `${piece.spin}deg` },
                          ],
                        },
                      },
                      animationDuration: `${piece.duration}ms`,
                      animationDelay: `${piece.delay}ms`,
                      animationTimingFunction: 'linear',
                      animationFillMode: 'both',
                      animationIterationCount: loop ? 'infinite' : 1,
                    },
                    styled?.stylePiece,
                  ],
                }}
              />
            ))
          : null}
      </StyledView>
    );
  },
);
Confetti.displayName = 'Confetti';

const defaults = Styler.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  piece: {
    position: 'absolute',
    top: 0,
    borderRadius: 2,
  },
});

export default Confetti;
