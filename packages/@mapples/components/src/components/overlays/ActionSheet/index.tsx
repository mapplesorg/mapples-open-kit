import {
  forwardRef,
  PropsWithChildren,
  useCallback,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView, Typography } from '@mapples/style';
import {
  DISABLED_OPACITY,
  Icon,
  TYPOGRAPHY_PARTS,
  Tokens,
  useShape,
  useTones,
} from '@mapples/ui';
import { Pressable, TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import {
  Option,
  OverlayRoot,
  readOptions,
  useControllableState,
} from '../../../internal';

import { defaults } from './defaults';

/** Props for {@link ActionSheet}. */
export interface ActionSheetProps extends Omit<ViewProps, 'children'> {
  /** Whether the sheet is shown (controlled). Omit to let it keep its own state. */
  visible?: boolean;
  /** Initial state while uncontrolled. Defaults to `false`. */
  defaultVisible?: boolean;
  /** Fires with the next visibility — `false` on every dismissal. */
  onVisibleChange?: (visible: boolean) => void;
  /** Fires when the sheet is dismissed without a choice. */
  onDismiss?: () => void;
  /** Heading above the options. */
  title?: string;
  /** Supporting text under the heading. */
  message?: string;
  /** The choices: `[{label, value, iconName?, destructive?, disabled?}]`. */
  options?: Option[];
  /** Fires with the chosen value (and the option) — the sheet then closes. */
  onSelect?: (value: string, option: Option) => void;
  /** Label of the cancel row. Defaults to `Cancel`. */
  cancelLabel?: string;
  /** Whether tapping the scrim dismisses. Defaults to `true`. */
  dismissOnBackdrop?: boolean;
  /** Styled slots for every visual part. */
  styled?: {
    /** The overlay layer (absolute fill). */
    style?: StyledProp<ViewStyle>;
    /** The scrim. */
    styleBackdrop?: StyledProp<ViewStyle>;
    /** The options card. */
    styleSheet?: StyledProp<ViewStyle>;
    /** The heading. */
    styleTitle?: StyledProp<TextStyle>;
    /** The message. */
    styleMessage?: StyledProp<TextStyle>;
    /** One option row. */
    styleOption?: StyledProp<ViewStyle>;
    /** An option label. */
    styleOptionLabel?: StyledProp<TextStyle>;
    /** A destructive option label. */
    styleOptionDestructive?: StyledProp<TextStyle>;
    /** The cancel card. */
    styleCancel?: StyledProp<ViewStyle>;
    /** The cancel label. */
    styleCancelLabel?: StyledProp<TextStyle>;
  };
}

/**
 * A bottom list of actions with an optional destructive choice and a cancel
 * row (the iOS action sheet). It paints over the parent it is placed in, so
 * it belongs as the LAST child of the page root; `visible` is two-way
 * bindable and `onSelect` receives the chosen value first.
 *
 * @example
 * ```tsx
 * <ActionSheet
 *   visible={open}
 *   onVisibleChange={setOpen}
 *   title="Photo"
 *   options={[
 *     { label: 'Share', value: 'share', iconName: 'share-outline' },
 *     { label: 'Delete', value: 'delete', destructive: true },
 *   ]}
 *   onSelect={handle}
 * />
 * ```
 *
 * @public
 */
const ActionSheet: ForwardRefExoticComponent<
  PropsWithChildren<ActionSheetProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<ActionSheetProps>>(
  (
    {
      visible,
      defaultVisible = false,
      onVisibleChange,
      onDismiss,
      title,
      message,
      options,
      onSelect,
      cancelLabel = 'Cancel',
      dismissOnBackdrop = true,
      styled,
      testID,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const shape = useShape();
    const items = readOptions(options, 'ActionSheet');
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
    const surface = tones.resolve(Tokens.color.surface);
    const destructive = tones.tone('error').main;

    return (
      <OverlayRoot
        ref={ref}
        visible={isVisible}
        align="bottom"
        enter="slide-up"
        dismissOnBackdrop={dismissOnBackdrop}
        onDismiss={close}
        style={styled?.style}
        styleBackdrop={styled?.styleBackdrop}
        modal
        testID={testID}
      >
        <StyledView styled={{ style: defaults.container }} {...rest}>
          <StyledView
            accessibilityViewIsModal
            styled={{
              style: [
                defaults.group,
                {
                  borderRadius: shape.radius.lg,
                  backgroundColor: surface,
                  borderWidth: tones.isDark ? shape.borderWidth(1) : 0,
                  borderColor: tones.outline,
                },
                styled?.styleSheet,
              ],
            }}
          >
            {title || message ? (
              <StyledView
                styled={{
                  style: [
                    defaults.header,
                    { borderBottomWidth: 1, borderBottomColor: tones.divider },
                  ],
                }}
              >
                {title ? (
                  <Typography
                    variant={TYPOGRAPHY_PARTS.label}
                    accessibilityRole="header"
                    style={[
                      { color: tones.resolve(Tokens.color.textSecondary) },
                      styled?.styleTitle,
                    ]}
                  >
                    {title}
                  </Typography>
                ) : null}
                {message ? (
                  <Typography
                    variant={TYPOGRAPHY_PARTS.helper}
                    style={[
                      { color: tones.resolve(Tokens.color.textTertiary) },
                      styled?.styleMessage,
                    ]}
                  >
                    {message}
                  </Typography>
                ) : null}
              </StyledView>
            ) : null}
            {items.map((option, index) => {
              const color = option.destructive ? destructive : text;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !!option.disabled }}
                  disabled={option.disabled}
                  onPress={() => {
                    setVisible(false);
                    onSelect?.(option.value, option);
                  }}
                >
                  <StyledView
                    styled={{
                      style: [
                        defaults.option,
                        index > 0 && {
                          borderTopWidth: 1,
                          borderTopColor: tones.divider,
                        },
                        option.disabled && { opacity: DISABLED_OPACITY },
                        styled?.styleOption,
                      ],
                    }}
                  >
                    {option.iconName ? (
                      <Icon
                        iconName={option.iconName}
                        size={22}
                        color={color}
                      />
                    ) : null}
                    <Typography
                      variant={TYPOGRAPHY_PARTS.body}
                      style={[
                        { color },
                        styled?.styleOptionLabel,
                        option.destructive && styled?.styleOptionDestructive,
                      ]}
                    >
                      {option.label}
                    </Typography>
                  </StyledView>
                </Pressable>
              );
            })}
          </StyledView>
          <Pressable accessibilityRole="button" onPress={close}>
            <StyledView
              styled={{
                style: [
                  defaults.cancel,
                  {
                    borderRadius: shape.radius.lg,
                    backgroundColor: surface,
                    borderWidth: tones.isDark ? shape.borderWidth(1) : 0,
                    borderColor: tones.outline,
                  },
                  styled?.styleCancel,
                ],
              }}
            >
              <Typography
                variant={TYPOGRAPHY_PARTS.button}
                style={[{ color: text }, styled?.styleCancelLabel]}
              >
                {cancelLabel}
              </Typography>
            </StyledView>
          </Pressable>
        </StyledView>
      </OverlayRoot>
    );
  },
);
ActionSheet.displayName = 'ActionSheet';

export default ActionSheet;
