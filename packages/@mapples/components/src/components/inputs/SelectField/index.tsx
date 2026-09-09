import { forwardRef, PropsWithChildren, useCallback, useState } from 'react';

import {
  StyledPressable,
  StyledProp,
  StyledScrollView,
  StyledView,
  Typography,
} from '@mapples/style';
import {
  CONTROL_SIZES,
  ControlSize,
  DISABLED_OPACITY,
  ELEVATION,
  Icon,
  RADII,
  Tokens,
  Tone,
  TYPOGRAPHY_PARTS,
  useTones,
} from '@mapples/ui';
import {
  Animated,
  Pressable,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import {
  DURATION,
  Glyph,
  Option,
  readOptions,
  useControllableState,
  useOptionalFormField,
  useSlotColor,
  useTimingValue,
} from '../../../internal';

import { defaults } from './defaults';
import { SELECT_FIELD_MENU, SelectFieldVariant } from './types';

/** Props for {@link SelectField}. */
export interface SelectFieldProps extends Omit<ViewProps, 'children'> {
  /** Text above the field. */
  label?: string;
  /** Selected value (controlled). Omit to let the field keep its own state. */
  value?: string;
  /** Initial value while uncontrolled; `''` selects nothing. */
  defaultValue?: string;
  /** Fires with the chosen value (and its option) — the new value is the first argument. */
  onValueChange?: (value: string, option: Option) => void;
  /** The choices: `[{label, value, iconName?, disabled?}]`. */
  options?: Option[];
  /** Text shown while nothing is selected. Defaults to `Select`. */
  placeholder?: string;
  /** Guidance under the field. */
  helperText?: string;
  /** Error under the field; a non-empty value paints the error state. */
  errorText?: string;
  /** Disables interaction and dims the field. */
  disabled?: boolean;
  /** Field height. Defaults to `md`. */
  size?: ControlSize;
  /** Surface: outlined box or tinted fill. Defaults to `outlined`. */
  variant?: SelectFieldVariant;
  /** Colour role of the open state and the selected option. Defaults to `primary`. */
  tone?: Tone;
  /** Binds the value to a field of the enclosing `FormView`; its error shows once touched. */
  fieldName?: string;
  /** Fires when the option list opens. */
  onOpen?: () => void;
  /** Fires when the option list closes. */
  onClose?: () => void;
  /** Styled slots for every visual part. */
  styled?: {
    /** The column holding label, field, list and helper. */
    style?: StyledProp<ViewStyle>;
    /** The field box. */
    styleField?: StyledProp<ViewStyle>;
    /** The field box while the list is open. */
    styleFieldFocused?: StyledProp<ViewStyle>;
    /** The field box while in error. */
    styleFieldError?: StyledProp<ViewStyle>;
    /** The label. */
    styleLabel?: StyledProp<TextStyle>;
    /** The selected option's text in the field. */
    styleValue?: StyledProp<TextStyle>;
    /** The placeholder text. */
    stylePlaceholder?: StyledProp<TextStyle>;
    /** The helper and error text. */
    styleHelper?: StyledProp<TextStyle>;
    /** The chevron and option glyphs (`color`). */
    styleIcon?: StyledProp<ViewStyle & { color?: string }>;
    /** The option list card. */
    styleMenu?: StyledProp<ViewStyle>;
    /** One option row. */
    styleOption?: StyledProp<ViewStyle>;
    /** The selected option row. */
    styleOptionSelected?: StyledProp<ViewStyle>;
    /** An option label. */
    styleOptionLabel?: StyledProp<TextStyle>;
  };
}

/**
 * A labelled dropdown whose option list expands inline, directly below the
 * field, so it is never clipped by a parent and needs no anchor
 * measurement. Choosing an option sets the value, reports it through
 * `onValueChange(value, option)` and closes the list.
 *
 * @example
 * ```tsx
 * <SelectField
 *   label="Country"
 *   placeholder="Choose a country"
 *   options={[
 *     { label: 'Germany', value: 'de' },
 *     { label: 'Spain', value: 'es' },
 *   ]}
 *   value={country}
 *   onValueChange={setCountry}
 * />
 * ```
 *
 * @public
 */
const SelectField = forwardRef<View, PropsWithChildren<SelectFieldProps>>(
  (
    {
      label,
      value,
      defaultValue = '',
      onValueChange,
      options,
      placeholder = 'Select',
      helperText,
      errorText,
      disabled = false,
      size = 'md',
      variant = 'outlined',
      tone = 'primary',
      fieldName,
      onOpen,
      onClose,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const palette = tones.tone(tone);
    const items = readOptions(options, 'SelectField');
    const field = useOptionalFormField<string>(fieldName);
    const [current, setCurrent] = useControllableState<string>({
      value: field.bound ? (field.value ?? '') : value,
      defaultValue,
      onChange: (next) => field.setValue(next),
    });
    const [open, setOpen] = useState(false);

    const toggle = useCallback(() => {
      if (disabled) return;
      const next = !open;
      setOpen(next);
      if (next) {
        onOpen?.();
      } else {
        field.touch();
        onClose?.();
      }
    }, [disabled, field, onClose, onOpen, open]);

    const select = useCallback(
      (option: Option) => {
        setCurrent(option.value);
        onValueChange?.(option.value, option);
        setOpen(false);
        field.touch();
        onClose?.();
      },
      [field, onClose, onValueChange, setCurrent],
    );

    const selected = items.find((option) => option.value === current);
    const error = errorText || field.error;
    const hasError = !!error;
    const spec = CONTROL_SIZES[size];
    const textColor = tones.resolve(Tokens.color.text);
    const secondary = tones.resolve(Tokens.color.textSecondary);
    const errorColor = tones.tone('error').main;
    const borderColor = hasError
      ? errorColor
      : open
        ? palette.main
        : variant === 'outlined'
          ? tones.outlineStrong
          : 'transparent';
    const glyphColor = useSlotColor(styled?.styleIcon, 'color', secondary);
    const rotation = useTimingValue(open ? 1 : 0, { duration: DURATION.fast });
    const rotate = rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    const rows = items.map((option) => {
      const isSelected = option.value === current;
      return (
        <Pressable
          key={option.value}
          accessibilityRole="button"
          accessibilityState={{
            selected: isSelected,
            disabled: !!option.disabled,
          }}
          disabled={option.disabled}
          onPress={() => select(option)}
        >
          <StyledView
            styled={{
              style: [
                defaults.option,
                { minHeight: SELECT_FIELD_MENU.optionHeight },
                isSelected && { backgroundColor: palette.container },
                option.disabled && { opacity: DISABLED_OPACITY },
                styled?.styleOption,
                isSelected && styled?.styleOptionSelected,
              ],
            }}
          >
            {option.iconName ? (
              <Icon
                iconName={option.iconName}
                size={spec.iconSize}
                color={glyphColor}
              />
            ) : null}
            <Typography
              variant={TYPOGRAPHY_PARTS.body}
              numberOfLines={1}
              style={[
                defaults.optionLabel,
                { color: textColor },
                styled?.styleOptionLabel,
              ]}
            >
              {option.label}
            </Typography>
            {isSelected ? (
              <Glyph name="check" size={spec.iconSize} color={palette.main} />
            ) : null}
          </StyledView>
        </Pressable>
      );
    });

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
        {label ? (
          <Typography
            variant={TYPOGRAPHY_PARTS.label}
            style={[{ color: secondary }, styled?.styleLabel]}
          >
            {label}
          </Typography>
        ) : null}
        <StyledPressable
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityValue={{ text: selected?.label ?? placeholder }}
          accessibilityState={{ expanded: open, disabled }}
          disabled={disabled}
          onPress={toggle}
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
              styled?.styleField,
              open && styled?.styleFieldFocused,
              hasError && styled?.styleFieldError,
            ],
          }}
        >
          {selected?.iconName ? (
            <Icon
              iconName={selected.iconName}
              size={spec.iconSize}
              color={glyphColor}
            />
          ) : null}
          {selected ? (
            <Typography
              variant={TYPOGRAPHY_PARTS.body}
              numberOfLines={1}
              style={[defaults.value, { color: textColor }, styled?.styleValue]}
            >
              {selected.label}
            </Typography>
          ) : (
            <Typography
              variant={TYPOGRAPHY_PARTS.body}
              numberOfLines={1}
              style={[
                defaults.value,
                { color: tones.placeholder },
                styled?.stylePlaceholder,
              ]}
            >
              {placeholder}
            </Typography>
          )}
          <Animated.View
            pointerEvents="none"
            style={{ transform: [{ rotate }] }}
          >
            <Glyph name="chevronDown" size={spec.iconSize} color={glyphColor} />
          </Animated.View>
        </StyledPressable>
        {open && items.length > 0 ? (
          <StyledView
            styled={{
              style: [
                defaults.menu,
                {
                  borderRadius: RADII.md,
                  borderWidth: 1,
                  borderColor: tones.outline,
                  backgroundColor: tones.resolve(Tokens.color.surface),
                  boxShadow: ELEVATION,
                },
                styled?.styleMenu,
              ],
            }}
          >
            {items.length > SELECT_FIELD_MENU.maxVisible ? (
              <StyledScrollView
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                styled={{ style: { maxHeight: SELECT_FIELD_MENU.maxHeight } }}
              >
                {rows}
              </StyledScrollView>
            ) : (
              rows
            )}
          </StyledView>
        ) : null}
        {hasError ? (
          <Typography
            variant={TYPOGRAPHY_PARTS.helper}
            accessibilityRole="alert"
            style={[{ color: errorColor }, styled?.styleHelper]}
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
SelectField.displayName = 'SelectField';

export default SelectField;
