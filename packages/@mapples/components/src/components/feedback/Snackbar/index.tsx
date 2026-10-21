import {
  forwardRef,
  PropsWithChildren,
  useCallback,
  useEffect,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView, Typography } from '@mapples/style';
import {
  ELEVATION,
  RADII,
  Tokens,
  TYPOGRAPHY_PARTS,
  useTones,
} from '@mapples/ui';
import { Pressable, TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import { Glyph, OverlayRoot, useControllableState } from '../../../internal';

import { defaults } from './defaults';
import { SnackbarPosition, SnackbarTone } from './types';

/** Props for {@link Snackbar}. */
export interface SnackbarProps extends Omit<ViewProps, 'children'> {
  /** The text. */
  message?: string;
  /** Label of the inline action ('Undo'); omit to hide it. */
  actionLabel?: string;
  /** Fires when the action is pressed (the snackbar then hides). */
  onActionPress?: () => void;
  /** Whether the snackbar is shown (controlled). Omit to let it keep its own state. */
  visible?: boolean;
  /** Initial state while uncontrolled. Defaults to `false`. */
  defaultVisible?: boolean;
  /** Fires with the next visibility — `false` when it hides. */
  onVisibleChange?: (visible: boolean) => void;
  /** Fires when the snackbar hides by timer, action or close. */
  onDismiss?: () => void;
  /** Auto-hide delay in ms; `0` keeps it until dismissed. Defaults to `4000`. */
  duration?: number;
  /** Edge it appears at. Defaults to `bottom`. */
  position?: SnackbarPosition;
  /** Colour role: an inverse surface, or a success/error fill. Defaults to `neutral`. */
  tone?: SnackbarTone;
  /** Shows a close glyph. */
  showClose?: boolean;
  /** Styled slots for every visual part. */
  styled?: {
    /** The overlay layer (absolute fill, taps pass through). */
    style?: StyledProp<ViewStyle>;
    /** The pill. */
    styleContainer?: StyledProp<ViewStyle>;
    /** The message text. */
    styleMessage?: StyledProp<TextStyle>;
    /** The action label. */
    styleAction?: StyledProp<TextStyle>;
    /** The close glyph button. */
    styleClose?: StyledProp<ViewStyle>;
  };
}

/**
 * A brief toast confirming an action, with one optional inline action and an
 * auto-hide timer. It floats over the parent it is placed in without blocking
 * it, so it belongs as the LAST child of the page root; `visible` is two-way
 * bindable.
 *
 * @example
 * ```tsx
 * <Snackbar
 *   visible={saved}
 *   onVisibleChange={setSaved}
 *   message="Photo saved"
 *   actionLabel="Undo"
 *   onActionPress={undo}
 * />
 * ```
 *
 * @public
 */
const Snackbar: ForwardRefExoticComponent<
  PropsWithChildren<SnackbarProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<SnackbarProps>>(
  (
    {
      message,
      actionLabel,
      onActionPress,
      visible,
      defaultVisible = false,
      onVisibleChange,
      onDismiss,
      duration = 4000,
      position = 'bottom',
      tone = 'neutral',
      showClose = false,
      styled,
      testID,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
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

    const hide = useCallback(() => {
      setVisible(false);
      onDismiss?.();
    }, [onDismiss, setVisible]);

    useEffect(() => {
      if (!isVisible || duration <= 0) return;
      const timer = setTimeout(hide, duration);
      return () => clearTimeout(timer);
    }, [duration, hide, isVisible]);

    const background =
      tone === 'neutral'
        ? tones.resolve(Tokens.color.inverse)
        : tones.tone(tone).main;
    const foreground =
      tone === 'neutral'
        ? tones.resolve(Tokens.color.background)
        : tones.tone(tone).contrast;
    const actionColor =
      tone === 'neutral' ? tones.resolve(Tokens.color.accentLight) : foreground;

    return (
      <OverlayRoot
        ref={ref}
        visible={isVisible}
        align={position}
        enter={position === 'bottom' ? 'slide-up' : 'slide-down'}
        backdrop={false}
        style={styled?.style}
        testID={testID}
      >
        <StyledView
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          styled={{
            style: [
              defaults.container,
              {
                borderRadius: RADII.md,
                backgroundColor: background,
                boxShadow: ELEVATION,
              },
              styled?.styleContainer,
            ],
          }}
          {...rest}
        >
          <Typography
            variant={TYPOGRAPHY_PARTS.body}
            style={[
              defaults.message,
              { color: foreground },
              styled?.styleMessage,
            ]}
          >
            {message}
          </Typography>
          {actionLabel ? (
            <Pressable
              accessibilityRole="button"
              hitSlop={4}
              onPress={() => {
                onActionPress?.();
                hide();
              }}
              style={defaults.action}
            >
              <Typography
                variant={TYPOGRAPHY_PARTS.button}
                style={[{ color: actionColor }, styled?.styleAction]}
              >
                {actionLabel}
              </Typography>
            </Pressable>
          ) : null}
          {showClose ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dismiss"
              hitSlop={4}
              onPress={hide}
              style={defaults.close}
            >
              <Glyph name="close" size={18} color={foreground} />
            </Pressable>
          ) : null}
        </StyledView>
      </OverlayRoot>
    );
  },
);
Snackbar.displayName = 'Snackbar';

export default Snackbar;
