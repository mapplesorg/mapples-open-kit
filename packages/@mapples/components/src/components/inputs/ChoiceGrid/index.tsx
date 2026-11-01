import {
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView } from '@mapples/style';
import { Tone } from '@mapples/ui';
import { TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import { useControllableState } from '../../../internal';

import ChoiceTile from './ChoiceTile';
import { defaults } from './defaults';
import {
  CHOICE_GRID_DEFAULTS,
  CHOICE_GRID_GAP,
  CHOICE_GRID_MODES,
  ChoiceGridMode,
  ChoiceGridOption,
  choiceGridSelection,
  ChoiceGridValue,
  readChoiceGridCount,
  readChoiceGridOptions,
} from './types';

/** Props for {@link ChoiceGrid}. */
export interface ChoiceGridProps extends Omit<ViewProps, 'children'> {
  /** The choices: `[{value, label?, iconName?, color?, disabled?, soldOut?}]`; each mode requires what it draws (icon → `iconName`, swatch → `color`, text and tile → `label`). */
  options?: ChoiceGridOption[];
  /** `icon` glyph tiles, `swatch` colour circles, `text` size cells, `tile` icon over label. Defaults to `tile`. */
  mode?: ChoiceGridMode;
  /** Several choices may be selected; the value is then a string array. Defaults to `false`. */
  multiple?: boolean;
  /** With `multiple`, the most choices that can be selected at once; the others stop responding until one is cleared. */
  maxSelected?: number;
  /** Tiles per row. Defaults per mode: icon 5, swatch 6, text 5, tile 3. */
  columns?: number;
  /** Draws a check on selected choices. Defaults to `false`. */
  showCheck?: boolean;
  /** Selection (controlled): one value (`''` for none), or a string array with `multiple`. Omit to let the grid keep its own state. */
  value?: ChoiceGridValue;
  /** Initial selection while uncontrolled. Defaults to none. */
  defaultValue?: ChoiceGridValue;
  /** Fires with the next selection — the new value is the first argument. */
  onValueChange?: (value: ChoiceGridValue) => void;
  /** Colour role of the selection. Defaults to `primary`. */
  tone?: Tone;
  /** Tile height in points — the circle diameter in `swatch` mode. Defaults per mode: icon 56, swatch 40, text 44, tile 88. */
  tileSize?: number;
  /** Space between tiles and rows in points. Defaults to `8`. */
  gap?: number;
  /** Disables every choice. */
  disabled?: boolean;
  /** Styled slots for every visual part. */
  styled?: {
    /** The grid. */
    style?: StyledProp<ViewStyle>;
    /** Every tile (the selection ring in `swatch` mode). */
    styleTile?: StyledProp<ViewStyle>;
    /** A selected tile. */
    styleTileSelected?: StyledProp<ViewStyle>;
    /** The labels. */
    styleLabel?: StyledProp<TextStyle>;
    /** The glyphs (`color`, `width` as their size). */
    styleIcon?: StyledProp<ViewStyle>;
    /** The colour circles (`swatch` mode). */
    styleSwatch?: StyledProp<ViewStyle>;
  };
}

/**
 * A grid of selectable tiles — an icon picker, product or habit colours,
 * clothing sizes with sold-out cells, or icon-over-label picks such as habit
 * or property types. One choice at a time (`value` is a string) or several
 * with `multiple` (a string array, capped by `maxSelected`). Tiles share
 * each row equally, `columns` to a row.
 *
 * @example
 * ```tsx
 * <ChoiceGrid
 *   mode="text"
 *   options={[
 *     { value: 'S', label: 'S' },
 *     { value: 'M', label: 'M' },
 *     { value: 'L', label: 'L', soldOut: true },
 *   ]}
 *   value={size}
 *   onValueChange={setSize}
 * />
 * ```
 *
 * @public
 */
const ChoiceGrid: ForwardRefExoticComponent<
  PropsWithChildren<ChoiceGridProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<ChoiceGridProps>>(
  (
    {
      options,
      mode = 'tile',
      multiple = false,
      maxSelected,
      columns,
      showCheck = false,
      value,
      defaultValue,
      onValueChange,
      tone = 'primary',
      tileSize,
      gap = CHOICE_GRID_GAP,
      disabled = false,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    if (!CHOICE_GRID_MODES.includes(mode)) {
      throw new Error(
        `ChoiceGrid: mode (${String(mode)}) must be one of ${CHOICE_GRID_MODES.join(', ')}`,
      );
    }
    const items = readChoiceGridOptions(options, mode);
    const perRow = readChoiceGridCount(
      columns ?? CHOICE_GRID_DEFAULTS[mode].columns,
      'columns',
    );
    const limit =
      maxSelected === undefined
        ? undefined
        : readChoiceGridCount(maxSelected, 'maxSelected');
    const size = tileSize ?? CHOICE_GRID_DEFAULTS[mode].tileSize;
    if (!Number.isFinite(size) || size <= 0) {
      throw new Error(
        `ChoiceGrid: tileSize (${String(tileSize)}) must be a positive number`,
      );
    }
    if (!Number.isFinite(gap) || gap < 0) {
      throw new Error(
        `ChoiceGrid: gap (${String(gap)}) must be a non-negative number`,
      );
    }

    const [current, setCurrent] = useControllableState<ChoiceGridValue>({
      value,
      defaultValue: defaultValue ?? (multiple ? [] : ''),
      onChange: onValueChange,
    });
    const selected = choiceGridSelection(current);
    const full = multiple && limit !== undefined && selected.length >= limit;

    const press = (optionValue: string, isSelected: boolean) => {
      if (!multiple) {
        setCurrent(optionValue);
        return;
      }
      const others = selected.filter((entry) => entry !== optionValue);
      setCurrent(isSelected ? others : [...others, optionValue]);
    };

    const rows: ChoiceGridOption[][] = [];
    for (let start = 0; start < items.length; start += perRow) {
      rows.push(items.slice(start, start + perRow));
    }

    return (
      <StyledView
        ref={ref}
        styled={{ style: [defaults.root, { gap }, styled?.style] }}
        {...rest}
      >
        {rows.map((row, rowIndex) => (
          <StyledView
            key={rowIndex}
            styled={{ style: [defaults.row, { gap }] }}
          >
            {Array.from({ length: perRow }, (_, cellIndex) => {
              const option = row[cellIndex];
              if (option === undefined) {
                // Keeps the last row's tiles the width of the others.
                return (
                  <StyledView
                    key={`empty-${cellIndex}`}
                    styled={{ style: defaults.cell }}
                  />
                );
              }
              const isSelected = selected.includes(option.value);
              return (
                <StyledView
                  key={option.value}
                  styled={{
                    style: [
                      defaults.cell,
                      mode === 'swatch' && defaults.cellCentred,
                    ],
                  }}
                >
                  <ChoiceTile
                    option={option}
                    mode={mode}
                    selected={isSelected}
                    disabled={disabled || !!option.disabled}
                    locked={full && !isSelected}
                    multiple={multiple}
                    showCheck={showCheck}
                    tileSize={size}
                    tone={tone}
                    onPress={() => press(option.value, isSelected)}
                    styleTile={styled?.styleTile}
                    styleTileSelected={styled?.styleTileSelected}
                    styleLabel={styled?.styleLabel}
                    styleIcon={styled?.styleIcon}
                    styleSwatch={styled?.styleSwatch}
                  />
                </StyledView>
              );
            })}
          </StyledView>
        ))}
      </StyledView>
    );
  },
);
ChoiceGrid.displayName = 'ChoiceGrid';

export default ChoiceGrid;
