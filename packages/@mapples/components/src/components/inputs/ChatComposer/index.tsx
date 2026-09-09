import { forwardRef, PropsWithChildren, useCallback, useState } from 'react';

import {
  StyledProp,
  StyledTextInput,
  StyledView,
  Typography,
} from '@mapples/style';
import { DISABLED_OPACITY, Icon, RADII, Tokens, useTones } from '@mapples/ui';
import {
  LayoutChangeEvent,
  Pressable,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import { Glyph, useControllableState, useSlotColor } from '../../../internal';

import { defaults } from './defaults';
import { CHAT_COMPOSER_GEOMETRY } from './types';

/** Props for {@link ChatComposer}. */
export interface ChatComposerProps extends Omit<ViewProps, 'children'> {
  /** Current draft (controlled). Omit to let the composer keep its own state. */
  value?: string;
  /** Initial draft while uncontrolled. */
  defaultValue?: string;
  /** Fires with the next draft — the new value is the first argument. */
  onChangeText?: (text: string) => void;
  /** Fires with the trimmed draft when it is sent; the field then clears. */
  onSend?: (text: string) => void;
  /** Hint shown while empty. Defaults to `Message`. */
  placeholder?: string;
  /** Accessibility label of the send button. Defaults to `Send`. */
  sendLabel?: string;
  /** Glyph of the leading button (project icon family); omit to hide the button. */
  leadingIconName?: string;
  /** Accessibility label of the leading button. Defaults to `Attach`. */
  leadingLabel?: string;
  /** Fires when the leading button is pressed. */
  onLeadingPress?: () => void;
  /** Glyph of the send button (project icon family); defaults to the built-in send arrow. */
  sendIconName?: string;
  /** Disables editing and sending and dims the composer. */
  disabled?: boolean;
  /** Lines the input grows to before it scrolls. Defaults to `5`. */
  maxLines?: number;
  /** Styled slots for every visual part. */
  styled?: {
    /** The row holding the buttons and the pill. */
    style?: StyledProp<ViewStyle>;
    /** The text input. */
    styleInput?: StyledProp<TextStyle>;
    /** The send button (`backgroundColor`; `color` tints its glyph). */
    styleSend?: StyledProp<ViewStyle & { color?: string }>;
    /** The leading glyph (`color`). */
    styleIcon?: StyledProp<ViewStyle & { color?: string }>;
  };
}

/**
 * A message composer: an optional leading (attach) button, a multi-line
 * input in a tinted pill that grows up to `maxLines`, and a round send
 * button that stays disabled while the draft is blank. `onSend` receives the
 * trimmed text and the field clears.
 *
 * @example
 * ```tsx
 * <ChatComposer
 *   placeholder="Write a message"
 *   leadingIconName="attach-outline"
 *   onLeadingPress={pickFile}
 *   onSend={sendMessage}
 * />
 * ```
 *
 * @public
 */
const ChatComposer = forwardRef<View, PropsWithChildren<ChatComposerProps>>(
  (
    {
      value,
      defaultValue = '',
      onChangeText,
      onSend,
      placeholder = 'Message',
      sendLabel = 'Send',
      leadingIconName,
      leadingLabel = 'Attach',
      onLeadingPress,
      sendIconName,
      disabled = false,
      maxLines = 5,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    if (!Number.isInteger(maxLines) || maxLines < 1) {
      throw new Error(
        `ChatComposer: maxLines (${maxLines}) must be a positive integer`,
      );
    }

    const tones = useTones();
    const palette = tones.tone('primary');
    const [text, setText] = useControllableState<string>({
      value,
      defaultValue,
      onChange: onChangeText,
    });
    // The draft's natural height comes from an invisible mirror of the text
    // laid out at the input's width — content-size events only ever grow on
    // the web, so the mirror is what lets the pill shrink again.
    const [mirrorHeight, setMirrorHeight] = useState<number>();

    const { button, lineHeight, paddingY } = CHAT_COMPOSER_GEOMETRY;
    const maxHeight = maxLines * lineHeight;
    const inputHeight =
      mirrorHeight === undefined
        ? undefined
        : Math.min(maxHeight, Math.max(lineHeight, mirrorHeight));

    const textColor = tones.resolve(Tokens.color.text);
    const glyphColor = useSlotColor(
      styled?.styleIcon,
      'color',
      tones.resolve(Tokens.color.textSecondary),
    );
    const sendColor = useSlotColor(
      styled?.styleSend,
      'color',
      palette.contrast,
    );

    const draft = text.trim();
    const canSend = draft.length > 0 && !disabled;
    const send = useCallback(() => {
      const trimmed = text.trim();
      if (!trimmed || disabled) return;
      onSend?.(trimmed);
      setText('');
    }, [disabled, onSend, setText, text]);
    const onMirrorLayout = useCallback(
      (event: LayoutChangeEvent) =>
        setMirrorHeight(event.nativeEvent.layout.height),
      [],
    );

    return (
      <StyledView
        ref={ref}
        styled={{
          style: [
            defaults.root,
            styled?.style,
            disabled && { opacity: DISABLED_OPACITY },
          ],
        }}
        {...rest}
      >
        {leadingIconName ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={leadingLabel}
            accessibilityState={{ disabled }}
            disabled={disabled}
            onPress={onLeadingPress}
            style={[defaults.leading, { width: button, height: button }]}
          >
            <Icon iconName={leadingIconName} size={24} color={glyphColor} />
          </Pressable>
        ) : null}
        <StyledView
          styled={{
            style: [
              defaults.field,
              {
                minHeight: button,
                paddingVertical: paddingY,
                borderRadius: RADII.pill,
                backgroundColor: tones.fill,
              },
            ],
          }}
        >
          <StyledView styled={{ style: defaults.inputWrap }}>
            <Typography
              pointerEvents="none"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              onLayout={onMirrorLayout}
              style={[
                defaults.mirror,
                { fontSize: 16, lineHeight },
                styled?.styleInput,
              ]}
            >
              {text || ' '}
            </Typography>
            <StyledTextInput
              accessibilityLabel={placeholder}
              accessibilityState={{ disabled }}
              editable={!disabled}
              value={text}
              onChangeText={setText}
              placeholder={placeholder}
              multiline
              returnKeyType="send"
              submitBehavior="submit"
              onSubmitEditing={send}
              styled={{
                placeholderTextColor: tones.placeholder,
                style: [
                  defaults.input,
                  {
                    color: textColor,
                    fontSize: 16,
                    lineHeight,
                    maxHeight,
                    height: inputHeight,
                  },
                  styled?.styleInput,
                ],
              }}
            />
          </StyledView>
        </StyledView>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={sendLabel}
          accessibilityState={{ disabled: !canSend }}
          disabled={!canSend}
          onPress={send}
        >
          <StyledView
            styled={{
              style: [
                defaults.send,
                {
                  width: button,
                  height: button,
                  borderRadius: button / 2,
                  backgroundColor: palette.main,
                },
                styled?.styleSend,
                !canSend && { opacity: DISABLED_OPACITY },
              ],
            }}
          >
            {sendIconName ? (
              <Icon iconName={sendIconName} size={20} color={sendColor} />
            ) : (
              <Glyph name="send" size={20} color={sendColor} />
            )}
          </StyledView>
        </Pressable>
      </StyledView>
    );
  },
);
ChatComposer.displayName = 'ChatComposer';

export default ChatComposer;
