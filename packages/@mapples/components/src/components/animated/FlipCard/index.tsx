import {
  Children,
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import {
  StyledPressable,
  StyledProp,
  StyledView,
  Styler,
} from '@mapples/style';
import { View, ViewProps, ViewStyle } from 'react-native';

import { useControllableState } from '../../../internal';

import {
  FLIP_CARD_AXES,
  FLIP_CARD_DURATION,
  FLIP_CARD_EASING,
  FLIP_CARD_PERSPECTIVE,
  FlipCardAxis,
} from './types';

/** Props for {@link FlipCard}. */
export interface FlipCardProps extends ViewProps {
  /** Whether the back is showing. Leave unset for the card to keep it itself. */
  flipped?: boolean;
  /** The side showing at first while `flipped` is unset. Defaults to the front. */
  defaultFlipped?: boolean;
  /** A press turns the card over. Defaults to `true`. */
  flipOnPress?: boolean;
  /** `horizontal` turns it like a page (around the vertical axis). Defaults to `horizontal`. */
  axis?: FlipCardAxis;
  /** How long the turn takes, in ms. Defaults to `600`. */
  duration?: number;
  /** Fires with the new side when the card is turned: `true` for the back. */
  onFlippedChange?: (flipped: boolean) => void;
  /** Styled slots for every visual part. */
  styled?: {
    /** The box both faces share; give it the card's size. */
    style?: StyledProp<ViewStyle>;
    /** Both faces. */
    styleFace?: StyledProp<ViewStyle>;
  };
}

/**
 * A card with two sides that turns over in 3D: its first child is the
 * front, its second the back (a loyalty card and its QR code). Both faces
 * fill the card and stay mounted; each turns with a transform transition
 * and gives way to the other half way through, so the flip does not depend
 * on the platform hiding back faces. A press turns it unless `flipOnPress`
 * is off; `flipped` controls it from a variable. With reduced motion the
 * sides swap at once.
 *
 * @example
 * ```tsx
 * <FlipCard styled={{ style: { height: 200 } }}>
 *   <LoyaltyCardFront />
 *   <LoyaltyCardQr />
 * </FlipCard>
 * ```
 *
 * @public
 */
const FlipCard: ForwardRefExoticComponent<
  PropsWithChildren<FlipCardProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<FlipCardProps>>(
  (
    {
      flipped: flippedProp,
      defaultFlipped = false,
      flipOnPress = true,
      axis = 'horizontal',
      duration = FLIP_CARD_DURATION,
      onFlippedChange,
      styled,
      children,
      ...rest
    },
    ref,
  ) => {
    if (!FLIP_CARD_AXES.includes(axis)) {
      throw new Error(
        `FlipCard: axis (${String(axis)}) must be ${FLIP_CARD_AXES.join(' or ')}`,
      );
    }
    if (!(duration >= 0)) {
      throw new Error(`FlipCard: duration (${duration}) must be 0 or more`);
    }

    const [flipped, setFlipped] = useControllableState({
      value: flippedProp,
      defaultValue: defaultFlipped,
      onChange: onFlippedChange,
    });

    const faces = Children.toArray(children);
    if (faces.length > 2) {
      throw new Error(
        `FlipCard: takes two children, the front and the back (got ${faces.length}); group each side in one View`,
      );
    }
    const [front, back] = faces;

    const turn = axis === 'horizontal' ? 'rotateY' : 'rotateX';
    const half = Math.round(duration / 2);

    /** One face: turned away by half a turn while the other side shows. */
    const face = (showing: boolean, awayAngle: string) => ({
      transform: [
        { perspective: FLIP_CARD_PERSPECTIVE },
        { [turn]: showing ? '0deg' : awayAngle },
      ],
      // The face gives way at the moment it is edge-on.
      opacity: showing ? 1 : 0,
      transitionProperty: ['transform', 'opacity'],
      transitionDuration: [`${duration}ms`, '0ms'],
      transitionDelay: ['0ms', `${half}ms`],
      transitionTimingFunction: [FLIP_CARD_EASING, 'linear'],
    });

    const content = (
      <>
        <StyledView
          pointerEvents={flipped ? 'none' : 'auto'}
          styled={{
            style: [
              defaults.front,
              face(!flipped, '180deg'),
              styled?.styleFace,
            ],
          }}
        >
          {front}
        </StyledView>
        <StyledView
          pointerEvents={flipped ? 'auto' : 'none'}
          accessibilityElementsHidden={!flipped}
          importantForAccessibility={flipped ? 'auto' : 'no-hide-descendants'}
          styled={{
            style: [defaults.back, face(flipped, '-180deg'), styled?.styleFace],
          }}
        >
          {back}
        </StyledView>
      </>
    );

    if (!flipOnPress) {
      return (
        <StyledView
          ref={ref}
          styled={{ style: [defaults.root, styled?.style] }}
          {...rest}
        >
          {content}
        </StyledView>
      );
    }

    return (
      <StyledPressable
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ expanded: flipped }}
        onPress={() => setFlipped(!flipped)}
        styled={{ style: [defaults.root, styled?.style] }}
        {...rest}
      >
        {content}
      </StyledPressable>
    );
  },
);
FlipCard.displayName = 'FlipCard';

const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
  },
  /**
   * The front is in the flow: it gives the card its height, and fills the
   * height the card was given.
   */
  front: {
    alignSelf: 'stretch',
    flexGrow: 1,
  },
  back: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default FlipCard;
