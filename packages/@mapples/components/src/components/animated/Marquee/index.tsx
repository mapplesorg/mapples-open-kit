import {
  forwardRef,
  PropsWithChildren,
  useState,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView, Styler } from '@mapples/style';
import { LayoutChangeEvent, View, ViewProps, ViewStyle } from 'react-native';

import { useReduceMotion } from '../../../internal';

import {
  MARQUEE_DIRECTIONS,
  MARQUEE_GAP,
  MARQUEE_SPEED,
  MarqueeDirection,
} from './types';

/** Props for {@link Marquee}. */
export interface MarqueeProps extends ViewProps {
  /** How fast the content travels, in points per second. Defaults to `40`. */
  speed?: number;
  /** Which way it travels. Defaults to `left`. */
  direction?: MarqueeDirection;
  /** The space between one run of the content and the next, in points. Defaults to `24`. */
  gap?: number;
  /** Whether it is moving. Defaults to `true`. */
  playing?: boolean;
  /** Styled slots for every visual part. */
  styled?: {
    /** The window the content travels through. */
    style?: StyledProp<ViewStyle>;
    /** One run of the content (a row). */
    styleContent?: StyledProp<ViewStyle>;
  };
}

/**
 * A ticker: its children travel sideways in an endless loop at a steady
 * speed (a news line, a row of logos). The content is laid out in a row
 * and drawn twice, so the second run enters as the first one leaves; one
 * loop moves the row by exactly its own width, which is measured. With the
 * OS's reduced-motion setting, where motion is turned off (a design canvas)
 * or with `playing` false, one run stands still.
 *
 * @example
 * ```tsx
 * <Marquee speed={30}>
 *   <Typography>Free oat milk on Fridays</Typography>
 *   <Typography>Double points this week</Typography>
 * </Marquee>
 * ```
 *
 * @public
 */
const Marquee: ForwardRefExoticComponent<
  PropsWithChildren<MarqueeProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<MarqueeProps>>(
  (
    {
      speed = MARQUEE_SPEED,
      direction = 'left',
      gap = MARQUEE_GAP,
      playing = true,
      styled,
      children,
      ...rest
    },
    ref,
  ) => {
    if (!(speed > 0)) {
      throw new Error(`Marquee: speed (${speed}) must be positive`);
    }
    if (!MARQUEE_DIRECTIONS.includes(direction)) {
      throw new Error(
        `Marquee: direction (${String(direction)}) must be ${MARQUEE_DIRECTIONS.join(' or ')}`,
      );
    }
    if (!(gap >= 0)) {
      throw new Error(`Marquee: gap (${gap}) must be 0 or more`);
    }

    const reduceMotion = useReduceMotion();
    const [runWidth, setRunWidth] = useState(0);
    const moving = playing && !reduceMotion && runWidth > 0;
    // One loop shifts the track by one run and the gap after it.
    const distance = runWidth + gap;

    const onRunLayout = (event: LayoutChangeEvent) =>
      setRunWidth(event.nativeEvent.layout.width);

    const run = (hidden: boolean) => (
      <StyledView
        onLayout={hidden ? undefined : onRunLayout}
        // The second run repeats the first for the eye only.
        accessibilityElementsHidden={hidden}
        importantForAccessibility={hidden ? 'no-hide-descendants' : 'auto'}
        aria-hidden={hidden}
        styled={{ style: [defaults.run, { gap }, styled?.styleContent] }}
      >
        {children}
      </StyledView>
    );

    return (
      <StyledView
        ref={ref}
        styled={{ style: [defaults.root, styled?.style] }}
        {...rest}
      >
        <StyledView
          styled={{
            style: [
              defaults.track,
              { gap },
              moving && {
                animationName: {
                  from: {
                    transform: [
                      { translateX: direction === 'left' ? 0 : -distance },
                    ],
                  },
                  to: {
                    transform: [
                      { translateX: direction === 'left' ? -distance : 0 },
                    ],
                  },
                },
                animationDuration: `${Math.round((distance / speed) * 1000)}ms`,
                animationTimingFunction: 'linear',
                animationIterationCount: 'infinite',
              },
            ],
          }}
        >
          {run(false)}
          {moving ? run(true) : null}
        </StyledView>
      </StyledView>
    );
  },
);
Marquee.displayName = 'Marquee';

const defaults = Styler.create({
  root: {
    overflow: 'hidden',
    flexDirection: 'row',
    alignSelf: 'stretch',
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  run: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
});

export default Marquee;
