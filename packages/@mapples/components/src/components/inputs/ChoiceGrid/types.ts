/**
 * How a choice is drawn: `icon` a glyph tile (icon picker), `swatch` a colour
 * circle with a ring when selected (product or habit colours), `text` a
 * labelled cell (sizes S/M/L/XL), `tile` an icon over a label (habit picks,
 * property types).
 */
export const CHOICE_GRID_MODES = ['icon', 'swatch', 'text', 'tile'] as const;
export type ChoiceGridMode = (typeof CHOICE_GRID_MODES)[number];

/** One choice of the grid. */
export interface ChoiceGridOption {
  /** The value the grid reports — unique within the grid. */
  value: string;
  /** Visible text (`text` and `tile` modes) and the spoken name in every mode. */
  label?: string;
  /** Glyph from the project icon family (`icon` and `tile` modes). */
  iconName?: string;
  /** Swatch colour — a theme token or a literal (`swatch` mode). */
  color?: string;
  /** Muted and not selectable. */
  disabled?: boolean;
  /** Struck through and not selectable — a size or colour out of stock. */
  soldOut?: boolean;
}

/** What the grid reports: one value (`''` for none), or a value array with `multiple`. */
export type ChoiceGridValue = string | string[];

/** Per-mode defaults shared by the component and its canvas schematic. */
export const CHOICE_GRID_DEFAULTS: Record<
  ChoiceGridMode,
  { columns: number; tileSize: number }
> = {
  icon: { columns: 5, tileSize: 56 },
  swatch: { columns: 6, tileSize: 40 },
  text: { columns: 5, tileSize: 44 },
  tile: { columns: 3, tileSize: 88 },
};

/** Space between tiles and rows, in points. */
export const CHOICE_GRID_GAP = 8;

/** Edge of the check badge (`showCheck`). */
export const CHOICE_GRID_CHECK_SIZE = 18;

/** Which fields a mode cannot draw without. */
const REQUIRED_FIELD: Record<
  ChoiceGridMode,
  keyof Pick<ChoiceGridOption, 'label' | 'iconName' | 'color'>
> = {
  icon: 'iconName',
  swatch: 'color',
  text: 'label',
  tile: 'label',
};

const SHAPE = '{value, label?, iconName?, color?, disabled?, soldOut?}';

/**
 * The choices a grid renders. A malformed entry, a repeated value or an
 * entry missing what its mode draws is a data error — it is reported, never
 * skipped.
 */
export const readChoiceGridOptions = (
  options: unknown,
  mode: ChoiceGridMode,
): ChoiceGridOption[] => {
  if (options === undefined || options === null) return [];
  if (!Array.isArray(options)) {
    throw new Error(`ChoiceGrid: options must be an array of ${SHAPE}`);
  }
  const seen = new Set<string>();
  return options.map((entry: unknown, index) => {
    if (typeof entry !== 'object' || entry === null) {
      throw new Error(`ChoiceGrid: options[${index}] must be ${SHAPE}`);
    }
    const option = entry as ChoiceGridOption;
    if (typeof option.value !== 'string' || option.value === '') {
      throw new Error(
        `ChoiceGrid: options[${index}].value must be a non-empty string`,
      );
    }
    if (seen.has(option.value)) {
      throw new Error(
        `ChoiceGrid: options[${index}].value "${option.value}" is repeated`,
      );
    }
    seen.add(option.value);
    for (const key of ['label', 'iconName', 'color'] as const) {
      if (option[key] !== undefined && typeof option[key] !== 'string') {
        throw new Error(
          `ChoiceGrid: options[${index}].${key} must be a string`,
        );
      }
    }
    for (const key of ['disabled', 'soldOut'] as const) {
      if (option[key] !== undefined && typeof option[key] !== 'boolean') {
        throw new Error(
          `ChoiceGrid: options[${index}].${key} must be a boolean`,
        );
      }
    }
    const required = REQUIRED_FIELD[mode];
    if (!option[required]) {
      throw new Error(
        `ChoiceGrid: options[${index}].${required} is required in ${mode} mode`,
      );
    }
    return option;
  });
};

/** A positive integer prop, or a clear error. */
export const readChoiceGridCount = (value: number, name: string): number => {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(
      `ChoiceGrid: ${name} (${String(value)}) must be a positive integer`,
    );
  }
  return value;
};

/** The selected values behind either value shape. */
export const choiceGridSelection = (value: ChoiceGridValue): string[] =>
  Array.isArray(value) ? value : value === '' ? [] : [value];
