import { forwardRef, PropsWithChildren, useCallback } from 'react';

import {
  StyledProp,
  StyledTextInput,
  StyledView,
  Typography,
} from '@mapples/style';
import {
  CONTROL_SIZES,
  ControlSize,
  DISABLED_OPACITY,
  Icon,
  Tokens,
  Tone,
  TYPOGRAPHY_PARTS,
  useTones,
} from '@mapples/ui';
import {
  NativeSyntheticEvent,
  Pressable,
  TargetedEvent,
  TextInput,
  TextInputProps,
  TextStyle,
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
import { InputFieldVariant } from './types';

/** Props for {@link InputField}. */
export interface InputFieldProps extends Omit<
  TextInputProps,
  'style' | 'value' | 'defaultValue' | 'onChangeText' | 'editable' | 'children'
> {
  /** Text above the field. */
  label?: string;
  /** Current text (controlled). Omit to let the field keep its own state. */
  value?: string;
  /** Initial text while uncontrolled. */
  defaultValue?: string;
  /** Fires with the next text — the new value is the first argument. */
  onChangeText?: (text: string) => void;
  /** Guidance under the field. */
  helperText?: string;
  /** Error under the field; a non-empty value paints the error state. */
  errorText?: string;
  /** Glyph before the text (project icon family). */
  leadingIconName?: string;
  /** Glyph after the text (project icon family). */
  trailingIconName?: string;
  /** Fires when the trailing glyph is pressed. */
  onTrailingIconPress?: () => void;
  /** Adds an eye toggle that reveals a secure entry. */
  showPasswordToggle?: boolean;
  /** Adds a clear glyph while the field has text. */
  clearable?: boolean;
  /** Fires after the clear glyph empties the field. */
  onClear?: () => void;
  /** Marks the label with an asterisk. */
  required?: boolean;
  /** Disables editing and dims the field. */
  disabled?: boolean;
  /** Height of a single-line field. Defaults to `md`. */
  size?: ControlSize;
  /** Surface: outlined box or tinted fill. Defaults to `outlined`. */
  variant?: InputFieldVariant;
  /** Colour role of the focused state. Defaults to `primary`. */
  tone?: Tone;
  /** Binds the text to a field of the enclosing `FormView`; its error shows once touched. */
  fieldName?: string;
  /** Styled slots for every visual part. */
  styled?: {
    /** The column holding label, field and helper. */
    style?: StyledProp<ViewStyle>;
    /** The field box. */
    styleField?: StyledProp<ViewStyle>;
    /** The field box while focused. */
    styleFieldFocused?: StyledProp<ViewStyle>;
    /** The field box while in error. */
    styleFieldError?: StyledProp<ViewStyle>;
    /** The text input. */
    styleInput?: StyledProp<TextStyle>;
    /** The label. */
    styleLabel?: StyledProp<TextStyle>;
    /** The helper text. */
    styleHelper?: StyledProp<TextStyle>;
    /** The error text. */
    styleError?: StyledProp<TextStyle>;
    /** The glyphs (`color`). */
    styleIcon?: StyledProp<ViewStyle & { color?: string }>;
  };
}

/**
 * The form text field: a label above, an outlined or filled box with
 * optional leading/trailing glyphs, helper or error text below. Handles
 * secure entry with an eye toggle, clearing, multi-line growth and the
 * keyboard/autofill props of a native input.
 *
 * @example
 * ```tsx
 * <InputField
 *   label="Email"
 *   placeholder="you@example.com"
 *   keyboardType="email-address"
 *   autoCapitalize="none"
 *   leadingIconName="mail-outline"
 *   value={email}
 *   onChangeText={setEmail}
 * />
 * ```
 *
 * @public
 */
const InputField = forwardRef<TextInput, PropsWithChildren<InputFieldProps>>(
  (
    {
      label,
      value,
      defaultValue = '',
      onChangeText,
      helperText,
      errorText,
      leadingIconName,
      trailingIconName,
      onTrailingIconPress,
      showPasswordToggle = false,
      clearable = false,
      onClear,
      required = false,
      disabled = false,
      size = 'md',
      variant = 'outlined',
      tone = 'primary',
      fieldName,
      secureTextEntry = false,
      multiline = false,
      numberOfLines,
      placeholder,
      onFocus,
      onBlur,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const palette = tones.tone(tone);
    const field = useOptionalFormField<string>(fieldName);
    const [text, setText] = useControllableState<string>({
      value: field.bound ? (field.value ?? '') : value,
      defaultValue,
      onChange: (next) => {
        field.setValue(next);
        onChangeText?.(next);
      },
    });
    const [revealed, setRevealed] = useControllableState<boolean>({
      value: undefined,
      defaultValue: false,
    });

    const handleBlur = useCallback(
      (event: NativeSyntheticEvent<TargetedEvent>) => {
        field.touch();
        onBlur?.(event);
      },
      [field, onBlur],
    );
    const interaction = useInteractionState(
      { onFocus, onBlur: handleBlur },
      disabled,
    );

    const error = errorText || field.error;
    const hasError = !!error;
    const spec = CONTROL_SIZES[size];
    const textColor = tones.resolve(Tokens.color.text);
    const errorColor = tones.tone('error').main;
    const borderColor = hasError
      ? errorColor
      : interaction.focused
        ? palette.main
        : variant === 'outlined'
          ? tones.outlineStrong
          : 'transparent';
    const glyphColor = useSlotColor(
      styled?.styleIcon,
      'color',
      tones.resolve(Tokens.color.textSecondary),
    );

    const clear = () => {
      setText('');
      onClear?.();
    };

    return (
      <StyledView
        styled={{
          style: [
            defaults.root,
            styled?.style,
            disabled && { opacity: DISABLED_OPACITY },
          ],
        }}
      >
        {label ? (
          <Typography
            variant={TYPOGRAPHY_PARTS.label}
            style={[
              { color: tones.resolve(Tokens.color.textSecondary) },
              styled?.styleLabel,
            ]}
          >
            {label}
            {required ? (
              <Typography
                variant={TYPOGRAPHY_PARTS.label}
                style={{ color: errorColor }}
              >
                {' *'}
              </Typography>
            ) : null}
          </Typography>
        ) : null}
        <StyledView
          styled={{
            style: [
              defaults.field,
              {
                minHeight: spec.height,
                paddingHorizontal: spec.paddingX - 4,
                borderRadius: spec.radius,
                borderColor,
                backgroundColor:
                  variant === 'filled' ? tones.fill : 'transparent',
              },
              multiline && defaults.multiline,
              multiline && { paddingVertical: 10 },
              styled?.styleField,
              interaction.focused && styled?.styleFieldFocused,
              hasError && styled?.styleFieldError,
            ],
          }}
        >
          {leadingIconName ? (
            <Icon
              iconName={leadingIconName}
              size={spec.iconSize}
              color={glyphColor}
            />
          ) : null}
          <StyledTextInput
            ref={ref}
            accessibilityLabel={label}
            accessibilityState={{ disabled }}
            editable={!disabled}
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            secureTextEntry={secureTextEntry && !revealed}
            multiline={multiline}
            numberOfLines={numberOfLines}
            onFocus={interaction.handlers.onFocus}
            onBlur={interaction.handlers.onBlur}
            styled={{
              placeholderTextColor: tones.placeholder,
              style: [
                defaults.input,
                { color: textColor, fontSize: 16, lineHeight: 22 },
                multiline &&
                  numberOfLines !== undefined && {
                    minHeight: numberOfLines * 22,
                    textAlignVertical: 'top',
                  },
                styled?.styleInput,
              ],
            }}
            {...rest}
          />
          {clearable && text.length > 0 && !disabled ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear"
              hitSlop={8}
              onPress={clear}
              style={defaults.glyphButton}
            >
              <Glyph name="clear" size={spec.iconSize} color={glyphColor} />
            </Pressable>
          ) : null}
          {secureTextEntry && showPasswordToggle ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
              hitSlop={8}
              onPress={() => setRevealed(!revealed)}
              style={defaults.glyphButton}
            >
              <Glyph
                name={revealed ? 'eyeOff' : 'eye'}
                size={spec.iconSize}
                color={glyphColor}
              />
            </Pressable>
          ) : null}
          {trailingIconName ? (
            <Pressable
              accessibilityRole="button"
              disabled={!onTrailingIconPress}
              hitSlop={8}
              onPress={onTrailingIconPress}
              style={defaults.glyphButton}
            >
              <Icon
                iconName={trailingIconName}
                size={spec.iconSize}
                color={glyphColor}
              />
            </Pressable>
          ) : null}
        </StyledView>
        {hasError ? (
          <Typography
            variant={TYPOGRAPHY_PARTS.helper}
            accessibilityRole="alert"
            style={[{ color: errorColor }, styled?.styleError]}
          >
            {error}
          </Typography>
        ) : helperText ? (
          <Typography
            variant={TYPOGRAPHY_PARTS.helper}
            style={[
              { color: tones.resolve(Tokens.color.textSecondary) },
              styled?.styleHelper,
            ]}
          >
            {helperText}
          </Typography>
        ) : null}
      </StyledView>
    );
  },
);
InputField.displayName = 'InputField';

export default InputField;
