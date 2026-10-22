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
import {
  ChipPresentation,
  ChipSelectedAppearance,
  ChipSize,
} from '../Chip/types';

import { defaults } from './defaults';
import {
  CHIP_GROUP_DEFAULT_COLUMNS,
  ChipGroupLayout,
  ChipGroupValue,
  ChipGroupVariant,
} from './types';

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
  /** One horizontally scrolling line instead of a wrapping row — the older spelling of `layout="scroll"`. Defaults to `false`. */
  scrollable?: boolean;
  /**
   * Arrangement: `wrap` content-sized chips wrapping onto new lines, `scroll`
   * one horizontally scrolling line, `grid` equal-width chips in `columns`
   * columns (time-slot grids). Wins over `scrollable` when both are set.
   * Defaults to `scroll` with `scrollable`, else `wrap`.
   */
  layout?: ChipGroupLayout;
  /** Column count of the `grid` layout — a whole number of at least 1. Defaults to `3`. */
  columns?: number;
  /** Chip role: `filter` chips toggle the selection, `assist` chips report a press. Defaults to `filter`. */
  variant?: ChipGroupVariant;
  /** Chip height. Defaults to `md`. */
  size?: ChipSize;
  /** Colour role of the selected chips. Defaults to `primary`. */
  tone?: Tone;
  /** Draws the check on selected `filter` chips; off, selection shows by colour alone. Defaults to `true`. */
  showSelectedIcon?: boolean;
  /** Selected chips as a soft `tonal` container or a solid `filled` tone. Defaults to `tonal`. */
  selectedAppearance?: ChipSelectedAppearance;
  /**
   * Chip form: `pill`, or `tile` — each option's `iconName` in a large circle
   * above its label (category rails; every option then needs an `iconName`).
   * Defaults to `pill`.
   */
  presentation?: ChipPresentation;
  /** Strikes through the labels of options marked `disabled` (sold out). Defaults to `false`. */
  strikeDisabled?: boolean;
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
    /** A chip while disabled (the group's `disabled` or an option's). */
    styleChipDisabled?: StyledProp<ViewStyle>;
    /** The icon circle of every `tile` chip. */
    styleChipCircle?: StyledProp<ViewStyle>;
    /** The icon circle of a selected `tile` chip. */
    styleChipCircleSelected?: StyledProp<ViewStyle>;
    /** Every chip label. */
    styleLabel?: StyledProp<TextStyle>;
    /** A chip label while selected. */
    styleLabelSelected?: StyledProp<TextStyle>;
    /** A chip label while disabled. */
    styleLabelDisabled?: StyledProp<TextStyle>;
    /** Every grid row (with `layout="grid"`). */
    styleRow?: StyledProp<ViewStyle>;
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
 * `layout` wraps the chips onto new lines, scrolls them on one line or sets
 * them in an equal-width `grid` of `columns`; `presentation="tile"` turns
 * each chip into an icon circle over its label.
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
      layout,
      columns = CHIP_GROUP_DEFAULT_COLUMNS,
      variant = 'filter',
      size = 'md',
      tone = 'primary',
      showSelectedIcon = true,
      selectedAppearance = 'tonal',
      presentation = 'pill',
      strikeDisabled = false,
      disabled = false,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const items = readOptions(options, 'ChipGroup');
    const arrangement: ChipGroupLayout =
      layout ?? (scrollable ? 'scroll' : 'wrap');
    if (
      arrangement === 'grid' &&
      (typeof columns !== 'number' || !Number.isInteger(columns) || columns < 1)
    ) {
      throw new Error(
        `ChipGroup: columns (${String(columns)}) must be a whole number of at least 1`,
      );
    }
    if (presentation === 'tile') {
      const bare = items.find((option) => !option.iconName);
      if (bare) {
        throw new Error(
          `ChipGroup: the tile presentation needs an iconName on every option (missing on "${bare.value}")`,
        );
      }
    }
    const isGrid = arrangement === 'grid';
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
          showSelectedIcon={showSelectedIcon}
          selectedAppearance={selectedAppearance}
          presentation={presentation}
          strikeDisabled={strikeDisabled && !!option.disabled}
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
            style: isGrid
              ? [defaults.gridCell, styled?.styleChip]
              : styled?.styleChip,
            styleSelected: styled?.styleChipSelected,
            styleDisabled: styled?.styleChipDisabled,
            styleCircle: styled?.styleChipCircle,
            styleCircleSelected: styled?.styleChipCircleSelected,
            styleLabel: styled?.styleLabel,
            styleLabelSelected: styled?.styleLabelSelected,
            styleLabelDisabled: styled?.styleLabelDisabled,
          }}
        />
      );
    });

    const rows: (typeof chips)[] = [];
    if (isGrid) {
      for (let start = 0; start < chips.length; start += columns) {
        rows.push(chips.slice(start, start + columns));
      }
    }

    return (
      <StyledView
        ref={ref}
        styled={{
          style: [
            arrangement === 'scroll'
              ? defaults.scrollRoot
              : isGrid
                ? defaults.grid
                : defaults.wrap,
            styled?.style,
          ],
        }}
        {...rest}
      >
        {isGrid ? (
          rows.map((row, rowIndex) => (
            <StyledView
              key={rowIndex}
              styled={{ style: [defaults.gridRow, styled?.styleRow] }}
            >
              {row}
              {Array.from({ length: columns - row.length }, (_, index) => (
                // Keeps the last row's chips at the shared column width.
                <View key={`spacer-${index}`} style={defaults.gridSpacer} />
              ))}
            </StyledView>
          ))
        ) : arrangement === 'scroll' ? (
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
