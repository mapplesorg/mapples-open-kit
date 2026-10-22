import {
  forwardRef,
  PropsWithChildren,
  useState,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView } from '@mapples/style';
import {
  ImageStyle,
  LayoutChangeEvent,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import { defaults } from './defaults';
import MasonryTile from './MasonryTile';
import {
  MASONRY_GRID_COLUMNS,
  MASONRY_GRID_DEFAULTS,
  MASONRY_GRID_ESTIMATED_COLUMN,
  MasonryGridItem,
  placeMasonry,
  readMasonryItems,
} from './types';

/** Props for {@link MasonryGrid}. */
export interface MasonryGridProps extends Omit<ViewProps, 'children'> {
  /** The tiles: `[{ id, source, aspectRatio, title?, tag? }]`; `aspectRatio` (width / height) is required and positive, ids are unique. */
  items?: MasonryGridItem[];
  /** Number of columns, 1–6. Defaults to `2`. */
  columns?: number;
  /** Space between columns and between tiles in points. Defaults to `12`. */
  gap?: number;
  /** Points every second column starts lower, for the staggered look (e.g. `40`). Defaults to `0`. */
  columnOffset?: number;
  /** Fires with the id of a pressed tile; unset, tiles are still images. */
  onItemPress?: (id: string) => void;
  /** Styled slots for every visual part. */
  styled?: {
    /** The grid. */
    style?: StyledProp<ViewStyle>;
    /** Every column. */
    styleColumn?: StyledProp<ViewStyle>;
    /** Every tile (photo and title). */
    styleTile?: StyledProp<ViewStyle>;
    /** Every photo. */
    styleImage?: StyledProp<ImageStyle>;
    /** The tag pill on the photo. */
    styleTag?: StyledProp<ViewStyle>;
    /** The tag text. */
    styleTagLabel?: StyledProp<TextStyle>;
    /** The title under the photo. */
    styleTitle?: StyledProp<TextStyle>;
  };
}

/**
 * Staggered columns of photo tiles that keep their own aspect ratios — a
 * travel app's saved places, a mood board, a recipe feed. Each tile goes
 * into the column that is shortest so far, and `columnOffset` drops every
 * second column for the staggered look. Tiles carry an optional tag pill on
 * the photo and a title under it. The grid is not virtualised or scrollable
 * on its own — place it in a scroll view.
 *
 * @example
 * ```tsx
 * <MasonryGrid
 *   columnOffset={40}
 *   items={[
 *     { id: 'lisbon', source: lisbonUri, aspectRatio: 0.75, title: 'Alfama at dusk', tag: 'Lisbon' },
 *     { id: 'kyoto', source: kyotoUri, aspectRatio: 1.25, title: 'Fushimi Inari', tag: 'Kyoto' },
 *   ]}
 *   onItemPress={openPlace}
 * />
 * ```
 *
 * @public
 */
const MasonryGrid: ForwardRefExoticComponent<
  PropsWithChildren<MasonryGridProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<MasonryGridProps>>(
  (
    {
      items = [],
      columns = MASONRY_GRID_DEFAULTS.columns,
      gap = MASONRY_GRID_DEFAULTS.gap,
      columnOffset = MASONRY_GRID_DEFAULTS.columnOffset,
      onItemPress,
      onLayout,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const component = 'MasonryGrid';
    const tiles = readMasonryItems(items, component);
    const { min, max } = MASONRY_GRID_COLUMNS;
    if (!Number.isInteger(columns) || columns < min || columns > max) {
      throw new Error(
        `${component}: columns (${String(columns)}) must be a whole number from ${min} to ${max}`,
      );
    }
    if (!(gap >= 0)) {
      throw new Error(`${component}: gap (${String(gap)}) must be 0 or more`);
    }
    if (!(columnOffset >= 0)) {
      throw new Error(
        `${component}: columnOffset (${String(columnOffset)}) must be 0 or more`,
      );
    }

    // Placement compares column heights, which depend on the column width;
    // until the grid is measured an estimate deals the first frame.
    const [width, setWidth] = useState(0);
    const columnWidth =
      width > 0
        ? (width - gap * (columns - 1)) / columns
        : MASONRY_GRID_ESTIMATED_COLUMN;
    const placed = placeMasonry(tiles, columns, columnWidth, gap, columnOffset);

    const handleLayout = (event: LayoutChangeEvent) => {
      setWidth(event.nativeEvent.layout.width);
      onLayout?.(event);
    };

    return (
      <StyledView
        ref={ref}
        accessibilityRole="list"
        onLayout={handleLayout}
        styled={{ style: [defaults.root, { gap }, styled?.style] }}
        {...rest}
      >
        {placed.map((indices, column) => (
          <StyledView
            key={column}
            styled={{
              style: [
                defaults.column,
                { gap, paddingTop: column % 2 === 1 ? columnOffset : 0 },
                styled?.styleColumn,
              ],
            }}
          >
            {indices.map((index) => (
              <MasonryTile
                key={tiles[index].id}
                item={tiles[index]}
                index={index}
                styled={styled}
                onPress={onItemPress}
              />
            ))}
          </StyledView>
        ))}
      </StyledView>
    );
  },
);
MasonryGrid.displayName = 'MasonryGrid';

export default MasonryGrid;
