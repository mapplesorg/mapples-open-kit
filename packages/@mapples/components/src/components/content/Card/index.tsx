import {
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledPressable, StyledProp, StyledView } from '@mapples/style';
import { Tokens, useElevation, useShape, useTones } from '@mapples/ui';
import { PressableProps, View, ViewStyle } from 'react-native';

import { CONTAINER_PRESS_ROLE, useInteractionState } from '../../../internal';

import { CardVariant } from './types';

/** Props for {@link Card}. */
export interface CardProps extends Omit<PressableProps, 'children' | 'style'> {
  /** Surface treatment. Defaults to `elevated`. */
  variant?: CardVariant;
  /** Makes the card a tap target (set automatically when `onPress` is wired). */
  pressable?: boolean;
  /** Inner padding in points. Defaults to `16`. */
  padding?: number;
  /** Styled slots. */
  styled?: {
    /** The card surface. */
    style?: StyledProp<ViewStyle>;
  };
}

/**
 * A themed surface for grouped content — children are the body. `elevated`
 * floats on a shadow (and a hairline on dark themes), `filled` tints,
 * `outlined` draws a border. Photo-topped tiles use `MediaCard`. With
 * `onPress` it is a button on native; on the web a focusable element instead
 * of a `<button>`, so buttons among the children do not nest inside one.
 *
 * @example
 * ```tsx
 * <Card variant="outlined" onPress={open}>
 *   <Typography variant="Subtitle">Weekly summary</Typography>
 *   <Typography variant="Body">You walked 42 km.</Typography>
 * </Card>
 * ```
 *
 * @public
 */
const Card: ForwardRefExoticComponent<
  PropsWithChildren<CardProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<CardProps>>(
  (
    {
      variant = 'elevated',
      pressable,
      padding = 16,
      onPress,
      onPressIn,
      onPressOut,
      onHoverIn,
      onHoverOut,
      disabled,
      styled,
      children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const shape = useShape();
    const elevation = useElevation();
    const interactive = pressable || !!onPress;
    const interaction = useInteractionState(
      { onPressIn, onPressOut, onHoverIn, onHoverOut },
      !!disabled,
    );

    const surface = tones.resolve(Tokens.color.surface);
    const style = [
      {
        alignSelf: 'stretch' as const,
        borderRadius: shape.radius.lg,
        padding,
        gap: 12,
        overflow: 'hidden' as const,
        backgroundColor: variant === 'filled' ? tones.fill : surface,
        borderWidth:
          variant === 'outlined' || tones.isDark ? shape.borderWidth(1) : 0,
        borderColor: tones.outline,
      },
      variant === 'elevated' && { boxShadow: elevation },
      styled?.style,
      interactive &&
        (interaction.pressed || interaction.hovered) && {
          backgroundColor: tones.stateLayer(
            tones.resolve(Tokens.color.text),
            interaction.pressed ? 'pressed' : 'hover',
          ),
        },
    ];

    if (interactive) {
      return (
        <StyledPressable
          ref={ref}
          accessibilityRole={CONTAINER_PRESS_ROLE}
          onPress={onPress}
          disabled={disabled}
          {...interaction.handlers}
          styled={{ style }}
          {...rest}
        >
          {children}
        </StyledPressable>
      );
    }

    return (
      <StyledView ref={ref} styled={{ style }} {...rest}>
        {children}
      </StyledView>
    );
  },
);
Card.displayName = 'Card';

export default Card;
