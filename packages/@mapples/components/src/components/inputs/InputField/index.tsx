import {
  forwardRef,
  PropsWithChildren,
  useCallback,
  type ComponentRef,
  ForwardRefExoticComponent,
  RefAttributes,
} from 'react';

import {
  StyledProp,
  StyledTextInput,
  StyledView,
  Typography,
} from '@mapples/style';
import {
  ControlSize,
  DISABLED_OPACITY,
  Icon,
  TYPOGRAPHY_PARTS,
  Tokens,
  Tone,
  useShape,
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
import { INPUT_FIELD_RULE, InputFieldVariant } from './types';

/** Props for {@link InputField}. */
export interface InputFieldProps extends Omit<
  TextInputProps,
  'style' | 'value' | 'defaultValue' | 'onChangeText' | 'editable' | 'children'
> {
  /** Text above the field. */
  label?: string;
  /** Supporting text above the field, under the label (`helperText` sits below the field). */
  description?: string;
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
  /** Glyph after the text (project icon family). Not with `trailingActionLabel`. */
  trailingIconName?: string;
  /** Fires when the trailing glyph is pressed. */
  onTrailingIconPress?: () => void;
  /** Text before the input, such as a currency ('€'). */
  prefix?: string;
  /** Text after the input, such as a unit ('kg'). */
  suffix?: string;
  /** A tone-coloured text button at the end of the field ('Apply'). Not with `trailingIconName`. */
  trailingActionLabel?: string;
  /** Fires when the trailing text button is pressed. */
  onTrailingActionPress?: () => void;
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
  /** Surface: outlined box, tinted fill, bottom rule only (`underlined`) or none (`plain`). Defaults to `outlined`. */
  variant?: InputFieldVariant;
  /** Colour role of the focused state and the trailing text button. Defaults to `primary`. */
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
    /** The description above the field. */
    styleDescription?: StyledProp<TextStyle>;
    /** The prefix text. */
    stylePrefix?: StyledProp<TextStyle>;
    /** The suffix text. */
    styleSuffix?: StyledProp<TextStyle>;
    /** The trailing text button's label. */
    styleTrailingAction?: StyledProp<TextStyle>;
    /** The helper text. */
    styleHelper?: StyledProp<TextStyle>;
    /** The error text. */
    styleError?: StyledProp<TextStyle>;
    /** The glyphs (`color`). */
    styleIcon?: StyledProp<ViewStyle & { color?: string }>;
  };
}

/**
 * The form text field: a label and description above; an outlined, filled,
 * underlined or plain field with optional leading/trailing glyphs,
 * prefix/suffix text and a trailing text button; helper or error text
 * below. Handles
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
 * <InputField
 *   label="Promo code"
 *   variant="underlined"
 *   trailingActionLabel="Apply"
 *   onTrailingActionPress={apply}
 * />
 * ```
 *
 * @public
 */
// Annotated so the emitted type names the instance through `ComponentRef`:
// React Native 0.88's TextInput instance type is not exported.
const InputField: ForwardRefExoticComponent<
  PropsWithChildren<InputFieldProps> &
    RefAttributes<ComponentRef<typeof TextInput>>
> = forwardRef<
  ComponentRef<typeof TextInput>,
  PropsWithChildren<InputFieldProps>
>(
  (
    {
      label,
      description,
      value,
      defaultValue = '',
      onChangeText,
      helperText,
      errorText,
      leadingIconName,
      trailingIconName,
      onTrailingIconPress,
      prefix,
      suffix,
      trailingActionLabel,
      onTrailingActionPress,
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
    if (trailingIconName && trailingActionLabel) {
      throw new Error(
        'InputField: trailingIconName and trailingActionLabel are exclusive — set one',
      );
    }

    const tones = useTones();
    const shape = useShape();
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
    const spec = shape.control[size];
    const textColor = tones.resolve(Tokens.color.text);
    const errorColor = tones.tone('error').main;
    const underlined = variant === 'underlined';
    const borderColor = hasError
      ? errorColor
      : interaction.focused
        ? palette.ink
        : variant === 'outlined' || underlined
          ? tones.outlineStrong
          : 'transparent';
    const secondary = tones.resolve(Tokens.color.textSecondary);
    const multilinePadding = multiline ? 10 : 0;
    const focusedRule = shape.emphasisWidth(INPUT_FIELD_RULE.focused);
    const rule = interaction.focused
      ? focusedRule
      : shape.borderWidth(INPUT_FIELD_RULE.rest);
    const surface: ViewStyle =
      variant === 'outlined' || variant === 'filled'
        ? {
            paddingHorizontal: spec.paddingX - 4,
            borderRadius: spec.radius,
            borderWidth: shape.borderWidth(1),
            borderColor,
            backgroundColor: variant === 'filled' ? tones.fill : 'transparent',
          }
        : underlined
          ? {
              ...defaults.bare,
              borderBottomWidth: rule,
              borderBottomColor: borderColor,
              // Keeps the height steady while the rule thickens.
              paddingBottom: multilinePadding + focusedRule - rule,
            }
          : defaults.bare;
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
        {label || description ? (
          <StyledView styled={{ style: defaults.header }}>
            {label ? (
              <Typography
                variant={TYPOGRAPHY_PARTS.label}
                style={[{ color: secondary }, styled?.styleLabel]}
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
            {description ? (
              <Typography
                variant={TYPOGRAPHY_PARTS.helper}
                style={[{ color: secondary }, styled?.styleDescription]}
              >
                {description}
              </Typography>
            ) : null}
          </StyledView>
        ) : null}
        <StyledView
          styled={{
            style: [
              defaults.field,
              { minHeight: spec.height },
              multiline && defaults.multiline,
              multiline && { paddingVertical: multilinePadding },
              surface,
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
          {prefix ? (
            <Typography
              variant={TYPOGRAPHY_PARTS.body}
              style={[{ color: secondary }, styled?.stylePrefix]}
            >
              {prefix}
            </Typography>
          ) : null}
          <StyledTextInput
            ref={ref}
            accessibilityLabel={label}
            accessibilityHint={description}
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
          {suffix ? (
            <Typography
              variant={TYPOGRAPHY_PARTS.body}
              style={[{ color: secondary }, styled?.styleSuffix]}
            >
              {suffix}
            </Typography>
          ) : null}
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
          {trailingActionLabel ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={trailingActionLabel}
              accessibilityState={{
                disabled: disabled || !onTrailingActionPress,
              }}
              disabled={disabled || !onTrailingActionPress}
              hitSlop={8}
              onPress={onTrailingActionPress}
              style={defaults.glyphButton}
            >
              <Typography
                variant={TYPOGRAPHY_PARTS.button}
                style={[{ color: palette.ink }, styled?.styleTrailingAction]}
              >
                {trailingActionLabel}
              </Typography>
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
            style={[{ color: secondary }, styled?.styleHelper]}
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
