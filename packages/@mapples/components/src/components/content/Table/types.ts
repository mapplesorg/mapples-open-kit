/** Cell text alignment. */
export const TABLE_ALIGNS = ['left', 'center', 'right'] as const;
export type TableAlign = (typeof TABLE_ALIGNS)[number];

/** One column of a {@link Table}. */
export interface TableColumn {
  /** The field read from each data row (remappable through `keyMap`). */
  key: string;
  /** Header text. */
  title: string;
  /** Fixed width in points; omit to share the remaining width. */
  width?: number;
  /** Text alignment of the column. Defaults to `left`. */
  align?: TableAlign;
}

/** A data row: any object — cells are read by column key. */
export type TableRowData = Record<string, unknown>;

/** Minimum row height. */
export const TABLE_ROW_HEIGHT = { regular: 48, dense: 36 } as const;

/** Width of a column without `width` while the table scrolls sideways. */
export const TABLE_SCROLL_COLUMN_WIDTH = 120;

/**
 * The columns a table renders. A malformed entry is a data error — it is
 * reported, never silently skipped, so an author sees which column is wrong.
 */
export const readTableColumns = (
  columns: unknown,
  component: string,
): TableColumn[] => {
  if (columns === undefined || columns === null) return [];
  if (!Array.isArray(columns)) {
    throw new Error(
      `${component}: columns must be an array of {key, title, width?, align?}`,
    );
  }
  columns.forEach((column, index) => {
    if (typeof column !== 'object' || column === null) {
      throw new Error(
        `${component}: columns[${index}] must be {key: string, title: string}`,
      );
    }
    const { key, title, width, align } = column as TableColumn;
    if (typeof key !== 'string' || typeof title !== 'string') {
      throw new Error(
        `${component}: columns[${index}] must be {key: string, title: string}`,
      );
    }
    if (width !== undefined && typeof width !== 'number') {
      throw new Error(`${component}: columns[${index}].width must be a number`);
    }
    if (align !== undefined && !TABLE_ALIGNS.includes(align)) {
      throw new Error(
        `${component}: columns[${index}].align must be one of ${TABLE_ALIGNS.join(', ')}`,
      );
    }
  });
  return columns as TableColumn[];
};

/**
 * The rows a table renders. Anything but an array of objects is a data
 * error and is reported rather than rendered as blanks.
 */
export const readTableData = (
  data: unknown,
  component: string,
): TableRowData[] => {
  if (data === undefined || data === null) return [];
  if (!Array.isArray(data)) {
    throw new Error(`${component}: data must be an array of objects`);
  }
  data.forEach((row, index) => {
    if (typeof row !== 'object' || row === null) {
      throw new Error(`${component}: data[${index}] must be an object`);
    }
  });
  return data as TableRowData[];
};
