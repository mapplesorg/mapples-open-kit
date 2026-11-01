import { ImageProps } from 'expo-image';

/** One row of a {@link ReorderableList}. */
export interface ReorderableListItem {
  /** Stable, unique key; `onReorder` reports the order as these ids. */
  id: string;
  /** Primary text. */
  title: string;
  /** Secondary text under the title. */
  subtitle?: string;
  /** Thumbnail at the start (a uri string or an expo-image source). */
  imageSource?: ImageProps['source'];
  /** Short text before the drag handle ("42 min"). */
  meta?: string;
}

/** Minimum row height in points. */
export const REORDERABLE_LIST_ROW_HEIGHT = 64;

/** Edge of the leading thumbnail in points. */
export const REORDERABLE_LIST_THUMBNAIL = 48;

/** Scale of the lifted row while it is dragged. */
export const REORDERABLE_LIST_LIFT_SCALE = 1.03;

/**
 * The validated rows. A malformed row or a repeated id is a data error — it
 * is reported, never skipped.
 */
export const readReorderableItems = (
  items: unknown,
  component: string,
): ReorderableListItem[] => {
  if (!Array.isArray(items)) {
    throw new Error(
      `${component}: items must be an array of {id, title, subtitle?, imageSource?, meta?}`,
    );
  }
  const seen = new Set<string>();
  return items.map((item: unknown, index) => {
    if (typeof item !== 'object' || item === null) {
      throw new Error(
        `${component}: items[${index}] must be {id: string, title: string, subtitle?, imageSource?, meta?}`,
      );
    }
    const entry = item as ReorderableListItem;
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
    if (typeof entry.title !== 'string') {
      throw new Error(`${component}: items[${index}].title must be a string`);
    }
    for (const key of ['subtitle', 'meta'] as const) {
      if (entry[key] !== undefined && typeof entry[key] !== 'string') {
        throw new Error(
          `${component}: items[${index}].${key} must be a string`,
        );
      }
    }
    return entry;
  });
};

/** `ids` with the entry at `from` moved to `to`. */
export const moveId = (ids: string[], from: number, to: number): string[] => {
  const next = [...ids];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

/**
 * The index the dragged row lands on: how many other rows have their middle
 * above the dragged row's middle. `heights` are the row heights in their
 * current order, `dy` how far the row has been dragged.
 */
export const reorderTarget = (
  heights: number[],
  from: number,
  dy: number,
): number => {
  const tops: number[] = [];
  heights.reduce((top, height) => {
    tops.push(top);
    return top + height;
  }, 0);
  const centre = tops[from] + heights[from] / 2 + dy;
  return heights.reduce(
    (count, height, index) =>
      index !== from && tops[index] + height / 2 < centre ? count + 1 : count,
    0,
  );
};

/** How far the row at `index` slides aside while the row at `from` hovers at `hover`. */
export const reorderShift = (
  index: number,
  from: number,
  hover: number,
  draggedHeight: number,
): number => {
  if (from < index && index <= hover) return -draggedHeight;
  if (hover <= index && index < from) return draggedHeight;
  return 0;
};
