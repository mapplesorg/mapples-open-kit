import { forwardRef, PropsWithChildren } from 'react';

import { StyledPressable, StyledProp, Typography } from '@mapples/style';
import {
  DISABLED_OPACITY,
  Icon,
  TYPOGRAPHY_PARTS,
  useTones,
} from '@mapples/ui';
import { PressableProps, TextStyle, View, ViewStyle } from 'react-native';

import { useInteractionState, useSlotColor } from '../../../internal';

import { defaults } from './defaults';
import {
  TEXT_LINK_ICON_SIZE,
  TEXT_LINK_PRESSED_OPACITY,
  TextLinkTone,
} from './types';

/** Props for {@link TextLink}. */
export interface TextLinkProps extends Omit<
  PressableProps,
  'children' | 'style'
> {
  /** Visible text. */
  label?: string;
  /** Glyph after the label (project icon family). */
  iconName?: string;
  /** Underlines the label. Defaults to `true`. */
  underline?: boolean;
  /** Colour role of the text. Defaults to `primary`. */
  tone?: TextLinkTone;
  /** Typography variant of the label. Defaults to `Link`. */
  typographyVariant?: string;
  /** Styled slots for every visual part. */
  styled?: {
    /** The pressable row. */
    style?: StyledProp<ViewStyle>;
    /** The label text. */
    styleLabel?: StyledProp<TextStyle>;
    /** The trailing glyph (`color`). */
    styleIcon?: StyledProp<ViewStyle & { color?: string }>;
  };
}

/**
 * An inline text link — the secondary action beside a button ('Forgot
 * password?', 'See all'). Content-sized, with a 44 pt hit area and an
 * optional trailing glyph.
 *
 * @example
 * ```tsx
 * <TextLink label="Forgot password?" onPress={openReset} />
 * ```
 *
 * @public
 */
const TextLink = forwardRef<View, PropsWithChildren<TextLinkProps>>(
  (
    {
      label,
      iconName,
      underline = true,
      tone = 'primary',
      typographyVariant = TYPOGRAPHY_PARTS.link,
      disabled,
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
    const interaction = useInteractionState(
      { onPressIn, onPressOut, onHoverIn, onHoverOut },
      isDisabled,
    );

    const labelColor = useSlotColor(
      styled?.styleLabel,
      'color',
      tones.tone(tone).main,
    );
    const glyphColor = useSlotColor(styled?.styleIcon, 'color', labelColor);

    return (
      <StyledPressable
        ref={ref}
        accessibilityRole="link"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled }}
        disabled={isDisabled}
        hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
        {...interaction.handlers}
        styled={{
          style: [
            defaults.root,
            styled?.style,
            interaction.pressed && { opacity: TEXT_LINK_PRESSED_OPACITY },
            isDisabled && { opacity: DISABLED_OPACITY },
          ],
        }}
        {...rest}
      >
        {!!label && (
          <Typography
            variant={typographyVariant}
            style={[
              { color: labelColor },
              underline && { textDecorationLine: 'underline' },
              styled?.styleLabel,
            ]}
          >
            {label}
          </Typography>
        )}
        {iconName ? (
          <Icon
            iconName={iconName}
            size={TEXT_LINK_ICON_SIZE}
            color={glyphColor}
          />
        ) : null}
      </StyledPressable>
    );
  },
);
TextLink.displayName = 'TextLink';

export default TextLink;
