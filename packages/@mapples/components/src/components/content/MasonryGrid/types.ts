import { ImageProps } from 'expo-image';

/** One tile of a {@link MasonryGrid}. */
export interface MasonryGridItem {
  /** Stable, unique key; `onItemPress` reports it. */
  id: string;
  /** The photo (a uri string or an expo-image source). */
  source: ImageProps['source'];
  /** Width divided by height of the photo (`0.75` portrait, `1.5` landscape); must be positive. */
  aspectRatio: number;
  /** Text under the photo. */
  title?: string;
  /** Short pill at the photo's bottom-start corner ("Lisbon"). */
  tag?: string;
}

/** Defaults shared by the component and its canvas schematic. */
export const MASONRY_GRID_DEFAULTS = {
  columns: 2,
  gap: 12,
  columnOffset: 0,
} as const;

/** How many columns the grid may have. */
export const MASONRY_GRID_COLUMNS = { min: 1, max: 6 } as const;

/** Lines the tile title may wrap to. */
export const MASONRY_GRID_TITLE_LINES = 2;

/**
 * Points a titled tile is assumed to add under its photo when choosing the
 * shortest column (the title is laid out after placement).
 */
export const MASONRY_GRID_TITLE_ALLOWANCE = 28;

/** Column width assumed for placement before the grid has been measured. */
export const MASONRY_GRID_ESTIMATED_COLUMN = 160;

/**
 * The validated tiles. A malformed tile or a repeated id is a data error —
 * it is reported, never skipped.
 */
export const readMasonryItems = (
  items: unknown,
  component: string,
): MasonryGridItem[] => {
  if (!Array.isArray(items)) {
    throw new Error(
      `${component}: items must be an array of {id, source, aspectRatio, title?, tag?}`,
    );
  }
  const seen = new Set<string>();
  return items.map((item: unknown, index) => {
    if (typeof item !== 'object' || item === null) {
      throw new Error(
        `${component}: items[${index}] must be {id: string, source, aspectRatio: number, title?, tag?}`,
      );
    }
    const entry = item as MasonryGridItem;
    if (typeof entry.id !== 'string' || entry.id === '') {
      throw new Error(
        `${component}: items[${index}].id must be a non-empty string`,
      );
    }
    if (seen.has(entry.id)) {
      throw new Error(
        `${component}: items[${index}].id "${entry.id}" is repeated; ids must be unique`,
      );
    }
    seen.add(entry.id);
    if (
      entry.source === undefined ||
      entry.source === null ||
      entry.source === ''
    ) {
      throw new Error(
        `${component}: items[${index}].source is required (a uri string or an image source)`,
      );
    }
    if (
      typeof entry.aspectRatio !== 'number' ||
      !Number.isFinite(entry.aspectRatio) ||
      entry.aspectRatio <= 0
    ) {
      throw new Error(
        `${component}: items[${index}].aspectRatio (${String(entry.aspectRatio)}) must be a positive number (width / height)`,
      );
    }
    for (const key of ['title', 'tag'] as const) {
      if (entry[key] !== undefined && typeof entry[key] !== 'string') {
        throw new Error(
          `${component}: items[${index}].${key} must be a string`,
        );
      }
    }
    return entry;
  });
};

/**
 * Deals the tiles into columns, each into the column that is shortest so far
 * (the leftmost on a tie). Every second column starts `columnOffset` points
 * lower. Returns the tile indices per column.
 */
export const placeMasonry = (
  items: MasonryGridItem[],
  columns: number,
  columnWidth: number,
  gap: number,
  columnOffset: number,
): number[][] => {
  const placed: number[][] = Array.from({ length: columns }, () => []);
  const heights = Array.from({ length: columns }, (_, column) =>
    column % 2 === 1 ? columnOffset : 0,
  );
  items.forEach((item, index) => {
    const column = heights.indexOf(Math.min(...heights));
    placed[column].push(index);
    heights[column] +=
      columnWidth / item.aspectRatio +
      (item.title ? MASONRY_GRID_TITLE_ALLOWANCE : 0) +
      gap;
  });
  return placed;
};
