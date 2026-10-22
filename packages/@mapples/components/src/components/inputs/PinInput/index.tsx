import {
  forwardRef,
  PropsWithChildren,
  useCallback,
  useRef,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView, Typography } from '@mapples/style';
import {
  DISABLED_OPACITY,
  TYPOGRAPHY_PARTS,
  Tokens,
  Tone,
  useShape,
  useTones,
} from '@mapples/ui';
import {
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  TextInput,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import {
  Glyph,
  useControllableState,
  useInteractionState,
  useOptionalFormField,
  useSlotColor,
} from '../../../internal';

import { defaults } from './defaults';
import { PIN_INPUT_GEOMETRY, PinInputSize } from './types';

/** Props for {@link PinInput}. */
export interface PinInputProps extends Omit<ViewProps, 'children'> {
  /** Current code (controlled). Omit to let the input keep its own state. */
  value?: string;
  /** Initial code while uncontrolled. */
  defaultValue?: string;
  /** Fires with the next code — the new value is the first argument. */
  onChangeText?: (text: string) => void;
  /** Fires with the code once every cell is filled. */
  onComplete?: (text: string) => void;
  /** Number of cells. Defaults to `4`. */
  length?: number;
  /** Shows a dot instead of each character. Defaults to `false`. */
  secure?: boolean;
  /** Keyboard to open. Defaults to `number-pad`. */
  keyboardType?: KeyboardTypeOptions;
  /** Focuses the input on mount. */
  autoFocus?: boolean;
  /** Paints every cell in the error tone. Defaults to `false`. */
  error?: boolean;
  /** Disables editing and dims the cells. */
  disabled?: boolean;
  /** Cell edge: `sm` 40, `md` 48, `lg` 56. Defaults to `md`. */
  size?: PinInputSize;
  /** Colour role of the active cell. Defaults to `primary`. */
  tone?: Tone;
  /** Binds the code to a field of the enclosing `FormView`; its error paints the cells once touched. */
  fieldName?: string;
  /** Styled slots for every visual part. */
  styled?: {
    /** The row of cells. */
    style?: StyledProp<ViewStyle>;
    /** One cell. */
    styleCell?: StyledProp<ViewStyle>;
    /** The cell that receives the next character. */
    styleCellActive?: StyledProp<ViewStyle>;
    /** A cell holding a character. */
    styleCellFilled?: StyledProp<ViewStyle>;
    /** A cell while in error. */
    styleCellError?: StyledProp<ViewStyle>;
    /** The character (or secure dot `color`). */
    styleDigit?: StyledProp<TextStyle>;
  };
}

/**
 * A row of single-character cells for one-time codes and PINs. One hidden
 * text input drives every cell, so autofill and the number pad work as they
 * do for a plain field; pressing any cell focuses it. `onComplete` fires with
 * the code once the last cell is filled.
 *
 * @example
 * ```tsx
 * <PinInput length={6} value={code} onChangeText={setCode} onComplete={verify} />
 * ```
 *
 * @public
 */
const PinInput: ForwardRefExoticComponent<
  PropsWithChildren<PinInputProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<PinInputProps>>(
  (
    {
      value,
      defaultValue = '',
      onChangeText,
      onComplete,
      length = 4,
      secure = false,
      keyboardType = 'number-pad',
      autoFocus = false,
      error = false,
      disabled = false,
      size = 'md',
      tone = 'primary',
      fieldName,
      accessibilityLabel,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    if (!Number.isInteger(length) || length < 1) {
      throw new Error(
        `PinInput: length (${length}) must be a positive integer`,
      );
    }

    const tones = useTones();

    const shape = useShape();
    const palette = tones.tone(tone);
    const field = useOptionalFormField<string>(fieldName);
    const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
    const [text, setText] = useControllableState<string>({
      value: field.bound ? (field.value ?? '') : value,
      defaultValue,
      onChange: (next) => {
        field.setValue(next);
        onChangeText?.(next);
      },
    });
    const touch = useCallback(() => field.touch(), [field]);
    const interaction = useInteractionState({ onBlur: touch }, disabled);

    const geometry = PIN_INPUT_GEOMETRY[size];
    const code = text.slice(0, length);
    const hasError = error || !!field.error;
    const errorColor = tones.tone('error').main;
    const textColor = tones.resolve(Tokens.color.text);
    const digitColor = useSlotColor(styled?.styleDigit, 'color', textColor);
    const activeIndex = interaction.focused
      ? Math.min(code.length, length - 1)
      : -1;

    const handleChange = useCallback(
      (next: string) => {
        const trimmed = next.slice(0, length);
        setText(trimmed);
        if (trimmed.length === length) onComplete?.(trimmed);
      },
      [length, onComplete, setText],
    );
    const focus = useCallback(() => inputRef.current?.focus(), []);

    return (
      <StyledView
        ref={ref}
        styled={{
          style: [
            defaults.root,
            { gap: geometry.gap },
            styled?.style,
            disabled && { opacity: DISABLED_OPACITY },
          ],
        }}
        {...rest}
      >
        <TextInput
          ref={inputRef}
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ disabled }}
          editable={!disabled}
          value={code}
          onChangeText={handleChange}
          maxLength={length}
          keyboardType={keyboardType}
          autoFocus={autoFocus}
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          caretHidden
          onFocus={interaction.handlers.onFocus}
          onBlur={interaction.handlers.onBlur}
          style={[StyleSheet.absoluteFill, { opacity: 0 }]}
        />
        {Array.from({ length }, (_, index) => {
          const character = code[index];
          const filled = character !== undefined;
          const active = index === activeIndex;
          const borderColor = hasError
            ? errorColor
            : active
              ? palette.ink
              : tones.outlineStrong;
          return (
            <Pressable
              key={index}
              accessible={false}
              disabled={disabled}
              onPress={focus}
            >
              <StyledView
                styled={{
                  style: [
                    defaults.cell,
                    {
                      width: geometry.cell,
                      height: geometry.cell,
                      borderRadius: shape.radius.sm,
                      borderColor,
                      borderWidth: active ? 2 : 1,
                    },
                    styled?.styleCell,
                    filled && styled?.styleCellFilled,
                    active && styled?.styleCellActive,
                    hasError && styled?.styleCellError,
                  ],
                }}
              >
                {filled ? (
                  secure ? (
                    <Glyph
                      name="dot"
                      size={geometry.digit}
                      color={digitColor}
                    />
                  ) : (
                    <Typography
                      variant={TYPOGRAPHY_PARTS.title}
                      style={[
                        { color: textColor, fontSize: geometry.digit },
                        styled?.styleDigit,
                      ]}
                    >
                      {character}
                    </Typography>
                  )
                ) : null}
              </StyledView>
            </Pressable>
          );
        })}
      </StyledView>
    );
  },
);
PinInput.displayName = 'PinInput';

export default PinInput;
