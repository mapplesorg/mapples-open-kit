import {
  forwardRef,
  PropsWithChildren,
  useCallback,
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
  Button,
  Icon,
  TYPOGRAPHY_PARTS,
  Tokens,
  useShape,
  useTones,
} from '@mapples/ui';
import { TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import { Glyph, useControllableState, useSlotColor } from '../../../internal';

import { defaults } from './defaults';
import { BANNER_GLYPH, BannerTone, BannerVariant } from './types';

/** Props for {@link Banner}. */
export interface BannerProps extends Omit<ViewProps, 'children'> {
  /** Heading. */
  title?: string;
  /** The text. */
  message?: string;
  /** Colour role, with a matching glyph. Defaults to `info`. */
  tone?: BannerTone;
  /** Glyph replacing the tone glyph (project icon family). */
  iconName?: string;
  /** Surface: a tinted container, a solid fill, or an outlined card. Defaults to `tonal`. */
  variant?: BannerVariant;
  /** Shows a close glyph that hides the banner and fires `onDismiss`. */
  dismissible?: boolean;
  /** Fires when the close glyph is pressed. */
  onDismiss?: () => void;
  /** Whether the banner is shown (controlled). Omit to let it keep its own state. */
  visible?: boolean;
  /** Initial state while uncontrolled. Defaults to `true`. */
  defaultVisible?: boolean;
  /** Fires with the next visibility — `false` when dismissed. */
  onVisibleChange?: (visible: boolean) => void;
  /** Label of the inline action; omit to hide it. */
  actionLabel?: string;
  /** Fires when the action is pressed. */
  onActionPress?: () => void;
  /** Label of the second, quieter action; omit to hide it. */
  secondaryActionLabel?: string;
  /** Fires when the secondary action is pressed. */
  onSecondaryActionPress?: () => void;
  /** Styled slots for every visual part. */
  styled?: {
    /** The strip. */
    style?: StyledProp<ViewStyle>;
    /** The glyph box (its `color` is the glyph colour). */
    styleIcon?: StyledProp<ViewStyle & { color?: string }>;
    /** The heading. */
    styleTitle?: StyledProp<TextStyle>;
    /** The message. */
    styleMessage?: StyledProp<TextStyle>;
    /** Each action button. */
    styleAction?: StyledProp<ViewStyle>;
    /** The close glyph button. */
    styleClose?: StyledProp<ViewStyle>;
  };
}

/**
 * A persistent message strip in the page flow — an offline notice, a
 * verification reminder, a success confirmation — with a tone glyph, a
 * title, a message and up to two inline actions. Not a toast: it stays until
 * dismissed or hidden through `visible`, and never floats over content.
 *
 * @example
 * ```tsx
 * <Banner
 *   tone="warning"
 *   title="You're offline"
 *   message="Changes will sync when you reconnect."
 *   actionLabel="Retry"
 *   onActionPress={reconnect}
 *   dismissible
 * />
 * ```
 *
 * @public
 */
const Banner: ForwardRefExoticComponent<
  PropsWithChildren<BannerProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<BannerProps>>(
  (
    {
      title,
      message,
      tone = 'info',
      iconName,
      variant = 'tonal',
      dismissible = false,
      onDismiss,
      visible,
      defaultVisible = true,
      onVisibleChange,
      actionLabel,
      onActionPress,
      secondaryActionLabel,
      onSecondaryActionPress,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const shape = useShape();
    const palette = tones.tone(tone);
    const [isVisible, setVisible] = useControllableState<boolean>({
      value: visible,
      defaultValue: defaultVisible,
      onChange: onVisibleChange,
    });

    const filled = variant === 'filled';
    const outlined = variant === 'outlined';
    const background = filled
      ? palette.main
      : outlined
        ? tones.resolve(Tokens.color.surface)
        : palette.container;
    const foreground = filled
      ? palette.contrast
      : tones.resolve(Tokens.color.text);
    const secondary = filled
      ? palette.contrast
      : tones.resolve(Tokens.color.textSecondary);
    const accent = filled ? palette.contrast : palette.ink;
    const glyphColor = useSlotColor(styled?.styleIcon, 'color', accent);
    // On a solid fill the text buttons take the contrast colour (their tone
    // colour would vanish into the background).
    const actionTypography = filled ? { color: palette.contrast } : undefined;

    const dismiss = useCallback(() => {
      setVisible(false);
      onDismiss?.();
    }, [onDismiss, setVisible]);

    if (!isVisible) return null;

    return (
      <StyledView
        ref={ref}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        styled={{
          style: [
            defaults.root,
            {
              paddingStart: 16,
              paddingEnd: dismissible ? 8 : 16,
              borderRadius: shape.radius.md,
              backgroundColor: background,
              borderWidth: outlined ? 1 : 0,
              borderColor: outlined ? palette.ink : 'transparent',
            },
            styled?.style,
          ],
        }}
        {...rest}
      >
        <StyledView styled={{ style: [defaults.icon, styled?.styleIcon] }}>
          {iconName ? (
            <Icon iconName={iconName} size={BANNER_GLYPH} color={glyphColor} />
          ) : (
            <Glyph name={tone} size={BANNER_GLYPH} color={glyphColor} />
          )}
        </StyledView>
        <StyledView styled={{ style: defaults.body }}>
          {title ? (
            <Typography
              variant={TYPOGRAPHY_PARTS.label}
              style={[{ color: foreground }, styled?.styleTitle]}
            >
              {title}
            </Typography>
          ) : null}
          {message ? (
            <Typography
              variant={TYPOGRAPHY_PARTS.body}
              style={[
                { color: title ? secondary : foreground },
                styled?.styleMessage,
              ]}
            >
              {message}
            </Typography>
          ) : null}
          {actionLabel || secondaryActionLabel ? (
            <StyledView styled={{ style: defaults.actions }}>
              {actionLabel ? (
                <Button
                  label={actionLabel}
                  variant="text"
                  size="sm"
                  tone={tone}
                  styled={{
                    style: styled?.styleAction,
                    styleTypography: actionTypography,
                  }}
                  onPress={onActionPress}
                />
              ) : null}
              {secondaryActionLabel ? (
                <Button
                  label={secondaryActionLabel}
                  variant="text"
                  size="sm"
                  tone={tone}
                  styled={{
                    style: styled?.styleAction,
                    styleTypography: actionTypography,
                  }}
                  onPress={onSecondaryActionPress}
                />
              ) : null}
            </StyledView>
          ) : null}
        </StyledView>
        {dismissible ? (
          <StyledPressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
            hitSlop={8}
            onPress={dismiss}
            styled={{ style: [defaults.close, styled?.styleClose] }}
          >
            <Glyph name="close" size={18} color={foreground} />
          </StyledPressable>
        ) : null}
      </StyledView>
    );
  },
);
Banner.displayName = 'Banner';

export default Banner;
