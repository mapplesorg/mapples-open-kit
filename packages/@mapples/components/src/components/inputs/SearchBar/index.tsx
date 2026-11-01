import {
  forwardRef,
  PropsWithChildren,
  useCallback,
  useRef,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
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
  TYPOGRAPHY_PARTS,
  Tokens,
  useShape,
  useTones,
} from '@mapples/ui';
import {
  NativeSyntheticEvent,
  Pressable,
  TargetedEvent,
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
  useSlotColor,
} from '../../../internal';

import { defaults } from './defaults';
import { SearchBarVariant } from './types';

/** Props for {@link SearchBar}. */
export interface SearchBarProps extends Omit<
  ViewProps,
  'children' | 'onFocus' | 'onBlur'
> {
  /** Current text (controlled). Omit to let the bar keep its own state. */
  value?: string;
  /** Initial text while uncontrolled. */
  defaultValue?: string;
  /** Fires with the next text — the new value is the first argument. */
  onChangeText?: (text: string) => void;
  /** Hint shown while empty. Defaults to `Search`. */
  placeholder?: string;
  /** Shows a cancel button while focused or non-empty. Defaults to `false`. */
  showCancel?: boolean;
  /** Label of the cancel button. Defaults to `Cancel`. */
  cancelLabel?: string;
  /** Focuses the field on mount. */
  autoFocus?: boolean;
  /** Field height. Defaults to `md`. */
  size?: ControlSize;
  /** Surface: tinted pill or outlined box. Defaults to `filled`. */
  variant?: SearchBarVariant;
  /** Fires with the text when the keyboard's search key is pressed. */
  onSubmit?: (text: string) => void;
  /** Fires after the clear glyph empties the field. */
  onClear?: () => void;
  /** Fires after the cancel button empties and blurs the field. */
  onCancel?: () => void;
  /** Fires when the field gains focus. */
  onFocus?: (event: NativeSyntheticEvent<TargetedEvent>) => void;
  /** Fires when the field loses focus. */
  onBlur?: (event: NativeSyntheticEvent<TargetedEvent>) => void;
  /** Disables editing and dims the bar. */
  disabled?: boolean;
  /** Styled slots for every visual part. */
  styled?: {
    /** The row holding field and cancel button. */
    style?: StyledProp<ViewStyle>;
    /** The field surface. */
    styleField?: StyledProp<ViewStyle>;
    /** The field surface while focused. */
    styleFieldFocused?: StyledProp<ViewStyle>;
    /** The text input. */
    styleInput?: StyledProp<TextStyle>;
    /** The search and clear glyphs (`color`). */
    styleIcon?: StyledProp<ViewStyle & { color?: string }>;
    /** The cancel label. */
    styleCancel?: StyledProp<TextStyle>;
  };
}

/**
 * A rounded search field with a leading search glyph, a clear glyph while it
 * has text and an optional cancel button. The text is controlled through
 * `value`/`onChangeText` or kept internally when `value` is omitted;
 * `onSubmit` receives the text when the keyboard's search key is pressed.
 *
 * @example
 * ```tsx
 * <SearchBar
 *   placeholder="Search recipes"
 *   value={query}
 *   onChangeText={setQuery}
 *   onSubmit={runSearch}
 *   showCancel
 * />
 * ```
 *
 * @public
 */
const SearchBar: ForwardRefExoticComponent<
  PropsWithChildren<SearchBarProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<SearchBarProps>>(
  (
    {
      value,
      defaultValue = '',
      onChangeText,
      placeholder = 'Search',
      showCancel = false,
      cancelLabel = 'Cancel',
      autoFocus = false,
      size = 'md',
      variant = 'filled',
      onSubmit,
      onClear,
      onCancel,
      onFocus,
      onBlur,
      disabled = false,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const shape = useShape();
    const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
    const [text, setText] = useControllableState<string>({
      value,
      defaultValue,
      onChange: onChangeText,
    });
    const interaction = useInteractionState({ onFocus, onBlur }, disabled);

    const spec = shape.control[size];
    const focusColor = tones.tone('primary').ink;
    const textColor = tones.resolve(Tokens.color.text);
    const borderColor = interaction.focused
      ? focusColor
      : variant === 'outlined'
        ? tones.outlineStrong
        : 'transparent';
    const glyphColor = useSlotColor(
      styled?.styleIcon,
      'color',
      tones.resolve(Tokens.color.textSecondary),
    );

    const focus = useCallback(() => inputRef.current?.focus(), []);
    const clear = useCallback(() => {
      setText('');
      onClear?.();
      inputRef.current?.focus();
    }, [onClear, setText]);
    const cancel = useCallback(() => {
      setText('');
      inputRef.current?.blur();
      onCancel?.();
    }, [onCancel, setText]);

    const cancelVisible =
      showCancel && (interaction.focused || text.length > 0);

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
        <StyledView
          styled={{
            style: [
              defaults.field,
              {
                minHeight: spec.height,
                paddingHorizontal: spec.paddingX - 4,
                borderRadius:
                  variant === 'filled' ? shape.radius.pill : spec.radius,
                borderWidth: shape.borderWidth(1),
                borderColor,
                backgroundColor:
                  variant === 'filled' ? tones.fill : 'transparent',
              },
              styled?.styleField,
              interaction.focused && styled?.styleFieldFocused,
            ],
          }}
        >
          <Pressable
            accessible={false}
            disabled={disabled}
            onPress={focus}
            style={defaults.glyphButton}
          >
            <Glyph name="search" size={spec.iconSize} color={glyphColor} />
          </Pressable>
          <StyledTextInput
            ref={inputRef}
            accessibilityRole="search"
            accessibilityLabel={placeholder}
            accessibilityState={{ disabled }}
            editable={!disabled}
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            autoFocus={autoFocus}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={() => onSubmit?.(text)}
            onFocus={interaction.handlers.onFocus}
            onBlur={interaction.handlers.onBlur}
            styled={{
              placeholderTextColor: tones.placeholder,
              style: [
                defaults.input,
                { color: textColor, fontSize: 16, lineHeight: 22 },
                styled?.styleInput,
              ],
            }}
          />
          {text.length > 0 && !disabled ? (
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
        </StyledView>
        {cancelVisible ? (
          <Pressable
            accessibilityRole="button"
            disabled={disabled}
            hitSlop={8}
            onPress={cancel}
            style={defaults.cancel}
          >
            <Typography
              variant={TYPOGRAPHY_PARTS.button}
              style={[{ color: focusColor }, styled?.styleCancel]}
            >
              {cancelLabel}
            </Typography>
          </Pressable>
        ) : null}
      </StyledView>
    );
  },
);
SearchBar.displayName = 'SearchBar';

export default SearchBar;
