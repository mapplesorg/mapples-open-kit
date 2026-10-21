import {
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView, Typography } from '@mapples/style';
import {
  DISABLED_OPACITY,
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
  useControllableState,
  useOptionalFormField,
  useSlotColor,
  useTimingValue,
} from '../../../internal';

import { defaults } from './defaults';
import { CHECKBOX_BOX, CheckboxLabelPosition, CheckboxSize } from './types';

/** Props for {@link Checkbox}. */
export interface CheckboxProps extends Omit<ViewProps, 'children'> {
  /** Checked state (controlled). Omit to let the checkbox keep its own state. */
  value?: boolean;
  /** Initial state while uncontrolled. Defaults to `false`. */
  defaultValue?: boolean;
  /** Fires with the next state — the new value is the first argument. */
  onValueChange?: (value: boolean) => void;
  /** Shows a dash instead of a check (a partially selected group). */
  indeterminate?: boolean;
  /** Text beside the box. */
  label?: string;
  /** Supporting text under the label. */
  description?: string;
  /** Which side the label sits on. Defaults to `right`. */
  labelPosition?: CheckboxLabelPosition;
  /** Box size. Defaults to `md`. */
  size?: CheckboxSize;
  /** Colour role of the checked state. Defaults to `primary`. */
  tone?: Tone;
  /** Disables interaction and dims the control. */
  disabled?: boolean;
  /** Binds the state to a field of the enclosing `FormView`. */
  fieldName?: string;
  /** Styled slots for every visual part. */
  styled?: {
    /** The row holding box and label. */
    style?: StyledProp<ViewStyle>;
    /** The box (unchecked). */
    styleBox?: StyledProp<ViewStyle>;
    /** The box while checked (its `backgroundColor` is the fill). */
    styleBoxChecked?: StyledProp<ViewStyle>;
    /** The check glyph (`color`). */
    styleCheck?: StyledProp<ViewStyle & { color?: string }>;
    /** The label text. */
    styleLabel?: StyledProp<TextStyle>;
    /** The description text. */
    styleDescription?: StyledProp<TextStyle>;
  };
}

/**
 * A labelled checkbox for independent yes/no choices (terms, multi-select
 * lists). Supports an indeterminate state for partially selected groups.
 *
 * @example
 * ```tsx
 * <Checkbox label="I agree to the terms" value={agreed} onValueChange={setAgreed} />
 * ```
 *
 * @public
 */
const Checkbox: ForwardRefExoticComponent<
  PropsWithChildren<CheckboxProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<CheckboxProps>>(
  (
    {
      value,
      defaultValue = false,
      onValueChange,
      indeterminate = false,
      label,
      description,
      labelPosition = 'right',
      size = 'md',
      tone = 'primary',
      disabled = false,
      fieldName,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const palette = tones.tone(tone);
    const field = useOptionalFormField<boolean>(fieldName);

    const [checked, setChecked] = useControllableState<boolean>({
      value: field.bound ? (field.value ?? false) : value,
      defaultValue,
      onChange: (next) => {
        field.setValue(next);
        onValueChange?.(next);
      },
    });

    const active = checked || indeterminate;
    const edge = CHECKBOX_BOX[size];
    const progress = useTimingValue(active ? 1 : 0, {
      duration: DURATION.fast,
    });
    const fill = useSlotColor(
      styled?.styleBoxChecked,
      'backgroundColor',
      palette.main,
    );
    const border = useSlotColor(
      styled?.styleBox,
      'borderColor',
      tones.outlineStrong,
    );
    const glyph = useSlotColor(styled?.styleCheck, 'color', palette.contrast);

    const labels = label ? (
      <StyledView styled={{ style: defaults.labels }}>
        <Typography
          variant={TYPOGRAPHY_PARTS.body}
          style={[
            { color: tones.resolve(Tokens.color.text) },
            styled?.styleLabel,
          ]}
        >
          {label}
        </Typography>
        {description ? (
          <Typography
            variant={TYPOGRAPHY_PARTS.helper}
            style={[
              { color: tones.resolve(Tokens.color.textSecondary) },
              styled?.styleDescription,
            ]}
          >
            {description}
          </Typography>
        ) : null}
      </StyledView>
    ) : null;

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
        {labelPosition === 'left' ? labels : null}
        <Pressable
          accessibilityRole="checkbox"
          accessibilityLabel={label}
          accessibilityState={{
            checked: indeterminate ? 'mixed' : checked,
            disabled,
          }}
          disabled={disabled}
          hitSlop={10}
          onPress={() => setChecked(!checked)}
        >
          <StyledView
            styled={{
              style: [
                defaults.box,
                {
                  width: edge,
                  height: edge,
                  borderRadius: RADII.xs,
                  borderColor: active ? fill : border,
                  backgroundColor: active ? fill : 'transparent',
                },
                styled?.styleBox,
                active && styled?.styleBoxChecked,
              ],
            }}
          >
            <Animated.View
              pointerEvents="none"
              style={{
                opacity: progress,
                transform: [
                  {
                    scale: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 1],
                    }),
                  },
                ],
              }}
            >
              <Glyph
                name={indeterminate ? 'minus' : 'check'}
                size={edge - 4}
                color={glyph}
              />
            </Animated.View>
          </StyledView>
        </Pressable>
        {labelPosition === 'right' ? labels : null}
      </StyledView>
    );
  },
);
Checkbox.displayName = 'Checkbox';

export default Checkbox;
