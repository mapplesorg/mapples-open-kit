import {
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
  Typography,
} from '@mapples/style';
import {
  DISABLED_OPACITY,
  ELEVATION,
  Icon,
  Tokens,
  TYPOGRAPHY_PARTS,
  useTones,
} from '@mapples/ui';
import { PressableProps, TextStyle, View, ViewStyle } from 'react-native';

import { useInteractionState, useSlotColor } from '../../../internal';

import { defaults } from './defaults';
import {
  FAB_EXTENDED,
  FAB_GEOMETRY,
  FAB_TOUCH_TARGET,
  FabSize,
  FabTone,
} from './types';

/** Props for {@link Fab}. */
export interface FabProps extends Omit<PressableProps, 'children' | 'style'> {
  /** Glyph (project icon family). Defaults to `add`. */
  iconName?: string;
  /** Text beside the glyph; makes this an extended Fab (56 high, whatever `size`). */
  label?: string;
  /** Edge of the square button: `sm` 40, `md` 56, `lg` 96. Defaults to `md`. */
  size?: FabSize;
  /** Colour role: a `primary` or `accent` fill, or the `surface` colour with a text-coloured glyph. Defaults to `primary`. */
  tone?: FabTone;
  /** Floats on a shadow (and a hairline on dark themes). Defaults to `true`. */
  elevated?: boolean;
  /** Disables interaction and dims the button. */
  disabled?: boolean;
  /** Styled slots for every visual part. */
  styled?: {
    /** The button — place it with absolute offsets here. */
    style?: StyledProp<ViewStyle>;
    /** The glyph (`color`). */
    styleIcon?: StyledProp<ViewStyle & { color?: string }>;
    /** The label text. */
    styleLabel?: StyledProp<TextStyle>;
  };
}

/**
 * A floating action button for the screen's one primary action (compose,
 * add, start). Icon-only by default; a `label` makes it an extended Fab.
 * Placement is the author's: put absolute offsets in `styled.style`
 * (`position: 'absolute', right: 16, bottom: 16`) inside the page root. An
 * icon-only Fab needs an `accessibilityLabel`.
 *
 * @example
 * ```tsx
 * <Fab
 *   iconName="add"
 *   accessibilityLabel="New note"
 *   onPress={compose}
 *   styled={{ style: { position: 'absolute', right: 16, bottom: 16 } }}
 * />
 * ```
 *
 * @public
 */
const Fab: ForwardRefExoticComponent<
  PropsWithChildren<FabProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<FabProps>>(
  (
    {
      iconName = 'add',
      label,
      size = 'md',
      tone = 'primary',
      elevated = true,
      disabled,
      accessibilityLabel,
      onPressIn,
      onPressOut,
      onHoverIn,
      onHoverOut,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const isDisabled = !!disabled;
    const extended = !!label;
    const geometry = FAB_GEOMETRY[size];
    const interaction = useInteractionState(
      { onPressIn, onPressOut, onHoverIn, onHoverOut },
      isDisabled,
    );

    const background =
      tone === 'surface'
        ? tones.resolve(Tokens.color.surface)
        : tones.tone(tone).main;
    const foreground =
      tone === 'surface'
        ? tones.resolve(Tokens.color.text)
        : tones.tone(tone).contrast;
    const labelColor = useSlotColor(styled?.styleLabel, 'color', foreground);
    const glyphColor = useSlotColor(styled?.styleIcon, 'color', foreground);

    const radius = extended ? FAB_EXTENDED.radius : geometry.radius;
    const hitSlop = extended
      ? 0
      : Math.max(0, (FAB_TOUCH_TARGET - geometry.edge) / 2);

    return (
      <StyledPressable
        ref={ref}
        accessibilityRole="button"
        accessibilityLabel={label || accessibilityLabel}
        accessibilityState={{ disabled: isDisabled }}
        disabled={isDisabled}
        hitSlop={hitSlop}
        {...interaction.handlers}
        styled={{
          style: [
            defaults.root,
            extended
              ? {
                  height: FAB_EXTENDED.height,
                  paddingHorizontal: FAB_EXTENDED.paddingX,
                  gap: FAB_EXTENDED.gap,
                }
              : { width: geometry.edge, height: geometry.edge },
            {
              borderRadius: radius,
              backgroundColor: background,
              borderWidth: elevated && tones.isDark ? 1 : 0,
              borderColor: tones.outline,
            },
            elevated && { boxShadow: ELEVATION },
            styled?.style,
            isDisabled && { opacity: DISABLED_OPACITY },
          ],
        }}
        {...rest}
      >
        {(interaction.pressed || interaction.hovered) && (
          <StyledView
            pointerEvents="none"
            styled={{
              style: [
                defaults.stateLayer,
                {
                  borderRadius: radius,
                  backgroundColor: tones.stateLayer(
                    foreground,
                    interaction.pressed ? 'pressed' : 'hover',
                  ),
                },
              ],
            }}
          />
        )}
        <Icon
          iconName={iconName}
          size={extended ? FAB_EXTENDED.icon : geometry.icon}
          color={glyphColor}
        />
        {extended ? (
          <Typography
            variant={TYPOGRAPHY_PARTS.button}
            numberOfLines={1}
            style={[{ color: labelColor }, styled?.styleLabel]}
          >
            {label}
          </Typography>
        ) : null}
      </StyledPressable>
    );
  },
);
Fab.displayName = 'Fab';

export default Fab;
