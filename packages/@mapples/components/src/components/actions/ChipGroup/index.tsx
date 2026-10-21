import {
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledScrollView, StyledView } from '@mapples/style';
import { Tone } from '@mapples/ui';
import { TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import { Option, readOptions, useControllableState } from '../../../internal';
import Chip from '../Chip';
import { ChipSize } from '../Chip/types';

import { defaults } from './defaults';
import { ChipGroupValue, ChipGroupVariant } from './types';

/** Props for {@link ChipGroup}. */
export interface ChipGroupProps extends Omit<ViewProps, 'children'> {
  /** The chips: `{label, value, iconName?, disabled?}` entries. */
  options?: Option[];
  /** Selection (controlled): one value, or a string array with `multiple`. Omit to let the group keep its own state. */
  value?: ChipGroupValue;
  /** Initial selection while uncontrolled. Defaults to none. */
  defaultValue?: ChipGroupValue;
  /** Fires with the next selection — the new value is the first argument. */
  onValueChange?: (value: ChipGroupValue) => void;
  /** Several chips may be selected; the value is then a string array. Defaults to `false`. */
  multiple?: boolean;
  /** One horizontally scrolling line instead of a wrapping row. Defaults to `false`. */
  scrollable?: boolean;
  /** Chip role: `filter` chips toggle the selection, `assist` chips report a press. Defaults to `filter`. */
  variant?: ChipGroupVariant;
  /** Chip height. Defaults to `md`. */
  size?: ChipSize;
  /** Colour role of the selected chips. Defaults to `primary`. */
  tone?: Tone;
  /** Disables every chip. */
  disabled?: boolean;
  /** Styled slots for every visual part. */
  styled?: {
    /** The group. */
    style?: StyledProp<ViewStyle>;
    /** The scrolling line's content (with `scrollable`). */
    contentContainerStyle?: StyledProp<ViewStyle>;
    /** Every chip. */
    styleChip?: StyledProp<ViewStyle>;
    /** A chip while selected. */
    styleChipSelected?: StyledProp<ViewStyle>;
    /** Every chip label. */
    styleLabel?: StyledProp<TextStyle>;
    /** A chip label while selected. */
    styleLabelSelected?: StyledProp<TextStyle>;
  };
}

/** The selected values behind either value shape. */
const selectedOf = (value: ChipGroupValue): string[] =>
  Array.isArray(value) ? value : value === '' ? [] : [value];

/**
 * A row of chips built from `options` — filters over a list, tags, quick
 * choices. `filter` chips toggle: one at a time by default (`value` is a
 * string, `''` for none) or several with `multiple` (`value` is a string
 * array). `assist` chips paint no selection and report the pressed value.
 * The row wraps onto new lines, or scrolls on one line with `scrollable`.
 *
 * @example
 * ```tsx
 * <ChipGroup
 *   options={[
 *     { label: 'Open now', value: 'open' },
 *     { label: 'Top rated', value: 'rated' },
 *     { label: 'Delivery', value: 'delivery' },
 *   ]}
 *   multiple
 *   value={filters}
 *   onValueChange={setFilters}
 * />
 * ```
 *
 * @public
 */
const ChipGroup: ForwardRefExoticComponent<
  PropsWithChildren<ChipGroupProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<ChipGroupProps>>(
  (
    {
      options,
      value,
      defaultValue,
      onValueChange,
      multiple = false,
      scrollable = false,
      variant = 'filter',
      size = 'md',
      tone = 'primary',
      disabled = false,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const items = readOptions(options, 'ChipGroup');
    const [current, setCurrent] = useControllableState<ChipGroupValue>({
      value,
      defaultValue: defaultValue ?? (multiple ? [] : ''),
      onChange: onValueChange,
    });
    const selected = selectedOf(current);
    const toggles = variant === 'filter';

    const select = (optionValue: string, next: boolean) => {
      if (!multiple) {
        setCurrent(next ? optionValue : '');
        return;
      }
      const others = selected.filter((entry) => entry !== optionValue);
      setCurrent(next ? [...others, optionValue] : others);
    };

    const chips = items.map((option) => {
      const isSelected = selected.includes(option.value);
      return (
        <Chip
          key={option.value}
          label={option.label}
          leadingIconName={option.iconName}
          variant={variant}
          size={size}
          tone={tone}
          disabled={disabled || !!option.disabled}
          selected={toggles ? isSelected : undefined}
          onSelectedChange={
            toggles ? (next) => select(option.value, next) : undefined
          }
          onPress={
            toggles
              ? undefined
              : () => setCurrent(multiple ? [option.value] : option.value)
          }
          styled={{
            style: styled?.styleChip,
            styleSelected: styled?.styleChipSelected,
            styleLabel: styled?.styleLabel,
            styleLabelSelected: styled?.styleLabelSelected,
          }}
        />
      );
    });

    return (
      <StyledView
        ref={ref}
        styled={{
          style: [
            scrollable ? defaults.scrollRoot : defaults.wrap,
            styled?.style,
          ],
        }}
        {...rest}
      >
        {scrollable ? (
          <StyledScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            styled={{
              contentContainerStyle: [
                defaults.scrollContent,
                styled?.contentContainerStyle,
              ],
            }}
          >
            {chips}
          </StyledScrollView>
        ) : (
          chips
        )}
      </StyledView>
    );
  },
);
ChipGroup.displayName = 'ChipGroup';

export default ChipGroup;
