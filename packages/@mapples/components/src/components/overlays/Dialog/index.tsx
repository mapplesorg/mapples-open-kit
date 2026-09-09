import { forwardRef, PropsWithChildren, useCallback } from 'react';

import { StyledProp, StyledView, Typography } from '@mapples/style';
import {
  Button,
  ELEVATION,
  Icon,
  RADII,
  Tokens,
  Tone,
  TYPOGRAPHY_PARTS,
  useTones,
} from '@mapples/ui';
import { Pressable, TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import { Glyph, OverlayRoot, useControllableState } from '../../../internal';

import { defaults } from './defaults';

/** Props for {@link Dialog}. */
export interface DialogProps extends Omit<ViewProps, 'children'> {
  /** Whether the dialog is shown (controlled). Omit to let it keep its own state. */
  visible?: boolean;
  /** Initial state while uncontrolled. Defaults to `false`. */
  defaultVisible?: boolean;
  /** Fires with the next visibility — `false` on every dismissal. */
  onVisibleChange?: (visible: boolean) => void;
  /** Fires when the dialog is dismissed by the backdrop, the close glyph or an action. */
  onDismiss?: () => void;
  /** Heading. */
  title?: string;
  /** Body text under the heading. */
  message?: string;
  /** Glyph above the heading (project icon family). */
  iconName?: string;
  /** Label of the filled action; omit to hide it. */
  primaryActionLabel?: string;
  /** Fires when the primary action is pressed (the dialog then closes). */
  onPrimaryActionPress?: () => void;
  /** Label of the text action; omit to hide it. */
  secondaryActionLabel?: string;
  /** Fires when the secondary action is pressed (the dialog then closes). */
  onSecondaryActionPress?: () => void;
  /** Colour role of the primary action; `error` for destructive confirmations. Defaults to `primary`. */
  tone?: Tone;
  /** Whether tapping the scrim dismisses. Defaults to `true`. */
  dismissOnBackdrop?: boolean;
  /** Shows a close glyph in the corner. */
  showClose?: boolean;
  /** Width cap of the card. Defaults to `400`. */
  maxWidth?: number;
  /** Styled slots for every visual part. */
  styled?: {
    /** The overlay layer (absolute fill). */
    style?: StyledProp<ViewStyle>;
    /** The scrim. */
    styleBackdrop?: StyledProp<ViewStyle>;
    /** The card. */
    styleDialog?: StyledProp<ViewStyle>;
    /** The heading. */
    styleTitle?: StyledProp<TextStyle>;
    /** The message. */
    styleMessage?: StyledProp<TextStyle>;
    /** The actions row. */
    styleActions?: StyledProp<ViewStyle>;
    /** The primary action button. */
    stylePrimaryAction?: StyledProp<ViewStyle>;
    /** The secondary action button. */
    styleSecondaryAction?: StyledProp<ViewStyle>;
    /** The close glyph button. */
    styleClose?: StyledProp<ViewStyle>;
  };
}

/**
 * A centred modal dialog: title, message, optional body children and one or
 * two actions. It paints over the parent it is placed in, so it belongs as
 * the LAST child of the page root; `visible` is two-way bindable and every
 * dismissal reports `onVisibleChange(false)`.
 *
 * @example
 * ```tsx
 * <Dialog
 *   visible={confirming}
 *   onVisibleChange={setConfirming}
 *   title="Delete photo?"
 *   message="This cannot be undone."
 *   tone="error"
 *   primaryActionLabel="Delete"
 *   onPrimaryActionPress={remove}
 *   secondaryActionLabel="Cancel"
 * />
 * ```
 *
 * @public
 */
const Dialog = forwardRef<View, PropsWithChildren<DialogProps>>(
  (
    {
      visible,
      defaultVisible = false,
      onVisibleChange,
      onDismiss,
      title,
      message,
      iconName,
      primaryActionLabel,
      onPrimaryActionPress,
      secondaryActionLabel,
      onSecondaryActionPress,
      tone = 'primary',
      dismissOnBackdrop = true,
      showClose = false,
      maxWidth = 400,
      styled,
      children,
      testID,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const [isVisible, setVisible] = useControllableState<boolean>({
      value: visible,
      defaultValue: defaultVisible,
      onChange: onVisibleChange,
    });

    const close = useCallback(() => {
      setVisible(false);
      onDismiss?.();
    }, [onDismiss, setVisible]);

    const text = tones.resolve(Tokens.color.text);

    return (
      <OverlayRoot
        ref={ref}
        visible={isVisible}
        align="center"
        enter="scale"
        dismissOnBackdrop={dismissOnBackdrop}
        onDismiss={close}
        style={styled?.style}
        styleBackdrop={styled?.styleBackdrop}
        modal
        testID={testID}
      >
        <StyledView
          accessibilityViewIsModal
          styled={{
            style: [
              defaults.card,
              {
                maxWidth,
                borderRadius: RADII.xl,
                backgroundColor: tones.resolve(Tokens.color.surface),
                boxShadow: ELEVATION,
                borderWidth: tones.isDark ? 1 : 0,
                borderColor: tones.outline,
              },
              styled?.styleDialog,
            ],
          }}
          {...rest}
        >
          {showClose ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={8}
              onPress={close}
              style={defaults.close}
            >
              <Glyph
                name="close"
                size={20}
                color={tones.resolve(Tokens.color.textSecondary)}
              />
            </Pressable>
          ) : null}
          {iconName ? (
            <Icon iconName={iconName} size={28} color={tones.tone(tone).main} />
          ) : null}
          {title || message ? (
            <StyledView styled={{ style: defaults.header }}>
              {title ? (
                <Typography
                  variant={TYPOGRAPHY_PARTS.title}
                  accessibilityRole="header"
                  style={[{ color: text }, styled?.styleTitle]}
                >
                  {title}
                </Typography>
              ) : null}
              {message ? (
                <Typography
                  variant={TYPOGRAPHY_PARTS.body}
                  style={[
                    { color: tones.resolve(Tokens.color.textSecondary) },
                    styled?.styleMessage,
                  ]}
                >
                  {message}
                </Typography>
              ) : null}
            </StyledView>
          ) : null}
          {children}
          {primaryActionLabel || secondaryActionLabel ? (
            <StyledView
              styled={{ style: [defaults.actions, styled?.styleActions] }}
            >
              {secondaryActionLabel ? (
                <Button
                  label={secondaryActionLabel}
                  variant="text"
                  tone="neutral"
                  styled={{ style: styled?.styleSecondaryAction }}
                  onPress={() => {
                    onSecondaryActionPress?.();
                    close();
                  }}
                />
              ) : null}
              {primaryActionLabel ? (
                <Button
                  label={primaryActionLabel}
                  variant="filled"
                  tone={tone}
                  styled={{ style: styled?.stylePrimaryAction }}
                  onPress={() => {
                    onPrimaryActionPress?.();
                    close();
                  }}
                />
              ) : null}
            </StyledView>
          ) : null}
        </StyledView>
      </OverlayRoot>
    );
  },
);
Dialog.displayName = 'Dialog';

export default Dialog;
