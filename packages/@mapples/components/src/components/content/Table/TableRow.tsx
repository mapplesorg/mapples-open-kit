import { FC } from 'react';

import {
  StyledPressable,
  StyledProp,
  StyledView,
  Typography,
} from '@mapples/style';
import { Tokens, TYPOGRAPHY_PARTS, useTones } from '@mapples/ui';
import { TextStyle, ViewStyle } from 'react-native';

import { useInteractionState } from '../../../internal';

import { defaults } from './defaults';
import { TableColumn } from './types';

export interface TableRowProps {
  /** The columns, in order. */
  columns: TableColumn[];
  /** One string per column. */
  cells: string[];
  /** Renders as the header row. */
  header?: boolean;
  /** Paints the alternate (striped) background. */
  alt?: boolean;
  /** The last row draws no bottom divider. */
  last?: boolean;
  /** Minimum row height. */
  minHeight: number;
  /** Tighter cell padding. */
  dense: boolean;
  /** Width rule of a column (fixed, scroll default or flex). */
  cellWidth: (column: TableColumn) => ViewStyle;
  /** Makes the row a tap target. */
  onPress?: () => void;
  /** The row slot (header or body). */
  styleRow?: StyledProp<ViewStyle>;
  /** The alternate-row slot, merged over `styleRow`. */
  styleRowAlt?: StyledProp<ViewStyle>;
  /** The cell text slot (header or body). */
  styleCell?: StyledProp<TextStyle>;
}

const ALIGN_ITEMS = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
} as const;

/** One header or body row of a `Table`. */
const TableRow: FC<TableRowProps> = ({
  columns,
  cells,
  header = false,
  alt = false,
  last = false,
  minHeight,
  dense,
  cellWidth,
  onPress,
  styleRow,
  styleRowAlt,
  styleCell,
}) => {
  const tones = useTones();
  const interaction = useInteractionState({}, !onPress);
  const text = tones.resolve(Tokens.color.text);
  const secondary = tones.resolve(Tokens.color.textSecondary);

  const style = [
    defaults.row,
    {
      minHeight,
      borderBottomWidth: last ? 0 : 1,
      borderBottomColor: tones.divider,
    },
    alt && { backgroundColor: tones.fill },
    styleRow,
    alt && styleRowAlt,
  ];

  const content = (
    <>
      {onPress && (interaction.pressed || interaction.hovered) ? (
        <StyledView
          pointerEvents="none"
          styled={{
            style: [
              defaults.stateLayer,
              {
                backgroundColor: tones.stateLayer(
                  text,
                  interaction.pressed ? 'pressed' : 'hover',
                ),
              },
            ],
          }}
        />
      ) : null}
      {columns.map((column, index) => {
        const align = column.align ?? 'left';
        return (
          <StyledView
            key={index}
            styled={{
              style: [
                defaults.cell,
                dense && defaults.cellDense,
                cellWidth(column),
                { alignItems: ALIGN_ITEMS[align] },
              ],
            }}
          >
            <Typography
              variant={header ? TYPOGRAPHY_PARTS.label : TYPOGRAPHY_PARTS.body}
              numberOfLines={header ? 1 : 2}
              style={[
                { color: header ? secondary : text, textAlign: align },
                styleCell,
              ]}
            >
              {cells[index]}
            </Typography>
          </StyledView>
        );
      })}
    </>
  );

  if (onPress) {
    return (
      <StyledPressable
        accessibilityRole="button"
        onPress={onPress}
        {...interaction.handlers}
        styled={{ style }}
      >
        {content}
      </StyledPressable>
    );
  }

  return <StyledView styled={{ style }}>{content}</StyledView>;
};

export default TableRow;
