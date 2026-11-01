import {
  forwardRef,
  PropsWithChildren,
  useState,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import {
  StyledProp,
  StyledScrollView,
  StyledView,
  Typography,
} from '@mapples/style';
import { TYPOGRAPHY_PARTS, Tokens, useShape, useTones } from '@mapples/ui';
import { get } from 'lodash';
import {
  LayoutChangeEvent,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import { defaults } from './defaults';
import TableRow from './TableRow';
import {
  readTableColumns,
  readTableData,
  TABLE_ROW_HEIGHT,
  TABLE_SCROLL_COLUMN_WIDTH,
  TableColumn,
  TableRowData,
} from './types';

/** Props for {@link Table}. */
export interface TableProps extends Omit<ViewProps, 'children'> {
  /** The columns: `[{ key, title, width?, align? }]`. */
  columns?: TableColumn[];
  /** The rows — any objects; cells are read by column `key`. */
  data?: TableRowData[];
  /** Remaps column keys to data paths (`{ name: 'user.fullName' }`). */
  keyMap?: Record<string, string>;
  /** Tints every other row. Defaults to `false`. */
  striped?: boolean;
  /** Shows the header row. Defaults to `true`. */
  showHeader?: boolean;
  /** Tighter rows (36 instead of 48 points). Defaults to `false`. */
  dense?: boolean;
  /** Text shown when `data` is empty. Defaults to `'No data'`. */
  emptyText?: string;
  /** Fires with the row object and its index when a row is pressed. */
  onRowPress?: (row: TableRowData, index: number) => void;
  /** Styled slots for every visual part. */
  styled?: {
    /** The table surface. */
    style?: StyledProp<ViewStyle>;
    /** The header row. */
    styleHeaderRow?: StyledProp<ViewStyle>;
    /** The header cell text. */
    styleHeaderCell?: StyledProp<TextStyle>;
    /** Each body row. */
    styleRow?: StyledProp<ViewStyle>;
    /** Every other body row while `striped`, merged over `styleRow`. */
    styleRowAlt?: StyledProp<ViewStyle>;
    /** The body cell text. */
    styleCell?: StyledProp<TextStyle>;
    /** The empty-state box. */
    styleEmpty?: StyledProp<ViewStyle>;
  };
}

/**
 * A small data table built from `columns` and `data`. Columns share the
 * width unless they set one; when the fixed widths outgrow the container
 * the table scrolls sideways. Cells render `String(value)`.
 *
 * @example
 * ```tsx
 * <Table
 *   columns={[
 *     { key: 'name', title: 'Name' },
 *     { key: 'qty', title: 'Qty', width: 64, align: 'right' },
 *   ]}
 *   data={[{ name: 'Espresso', qty: 2 }, { name: 'Croissant', qty: 1 }]}
 *   striped
 *   onRowPress={(row) => open(row)}
 * />
 * ```
 *
 * @public
 */
const Table: ForwardRefExoticComponent<
  PropsWithChildren<TableProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<TableProps>>(
  (
    {
      columns,
      data,
      keyMap,
      striped = false,
      showHeader = true,
      dense = false,
      emptyText = 'No data',
      onRowPress,
      onLayout,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const shape = useShape();
    const [containerWidth, setContainerWidth] = useState(0);
    const cols = readTableColumns(columns, 'Table');
    const rows = readTableData(data, 'Table');

    const declaredWidth = cols.reduce(
      (sum, column) => sum + (column.width ?? 0),
      0,
    );
    const scrolls = containerWidth > 0 && declaredWidth > containerWidth;
    const minHeight = dense ? TABLE_ROW_HEIGHT.dense : TABLE_ROW_HEIGHT.regular;

    const cellWidth = (column: TableColumn): ViewStyle =>
      column.width !== undefined
        ? { width: column.width }
        : scrolls
          ? { width: TABLE_SCROLL_COLUMN_WIDTH }
          : { flex: 1 };

    const pathOf = (column: TableColumn) => keyMap?.[column.key] ?? column.key;
    const cellsOf = (row: TableRowData) =>
      cols.map((column) => String(get(row, pathOf(column)) ?? ''));

    const handleLayout = (event: LayoutChangeEvent) => {
      setContainerWidth(event.nativeEvent.layout.width);
      onLayout?.(event);
    };

    const table = (
      <StyledView styled={{ style: defaults.table }}>
        {showHeader ? (
          <TableRow
            header
            columns={cols}
            cells={cols.map((column) => column.title)}
            minHeight={minHeight}
            dense={dense}
            cellWidth={cellWidth}
            styleRow={styled?.styleHeaderRow}
            styleCell={styled?.styleHeaderCell}
          />
        ) : null}
        {rows.map((row, index) => (
          <TableRow
            key={index}
            columns={cols}
            cells={cellsOf(row)}
            alt={striped && index % 2 === 1}
            last={index === rows.length - 1}
            minHeight={minHeight}
            dense={dense}
            cellWidth={cellWidth}
            onPress={onRowPress ? () => onRowPress(row, index) : undefined}
            styleRow={styled?.styleRow}
            styleRowAlt={styled?.styleRowAlt}
            styleCell={styled?.styleCell}
          />
        ))}
      </StyledView>
    );

    return (
      <StyledView
        ref={ref}
        onLayout={handleLayout}
        styled={{
          style: [
            defaults.root,
            {
              borderRadius: shape.radius.md,
              borderWidth: shape.borderWidth(1),
              borderColor: tones.outline,
              backgroundColor: tones.resolve(Tokens.color.surface),
            },
            styled?.style,
          ],
        }}
        {...rest}
      >
        {scrolls ? (
          <StyledScrollView horizontal showsHorizontalScrollIndicator>
            {table}
          </StyledScrollView>
        ) : (
          table
        )}
        {rows.length === 0 ? (
          <StyledView styled={{ style: [defaults.empty, styled?.styleEmpty] }}>
            <Typography
              variant={TYPOGRAPHY_PARTS.helper}
              style={{ color: tones.resolve(Tokens.color.textSecondary) }}
            >
              {emptyText}
            </Typography>
          </StyledView>
        ) : null}
      </StyledView>
    );
  },
);
Table.displayName = 'Table';

export default Table;
