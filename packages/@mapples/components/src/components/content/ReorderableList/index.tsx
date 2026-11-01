import {
  forwardRef,
  PropsWithChildren,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView } from '@mapples/style';
import {
  AccessibilityInfo,
  Animated,
  ImageStyle,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import { defaults } from './defaults';
import ReorderableRow from './ReorderableRow';
import {
  moveId,
  readReorderableItems,
  ReorderableListItem,
  reorderShift,
  reorderTarget,
} from './types';

/** Props for {@link ReorderableList}. */
export interface ReorderableListProps extends Omit<ViewProps, 'children'> {
  /** The rows in their initial order: `[{ id, title, subtitle?, imageSource?, meta? }]`; ids must be unique. A new `items` order (different ids or order) replaces the list's own. */
  items?: ReorderableListItem[];
  /** Fires with every row id in the new order after a drop or a "Move up/down" action. */
  onReorder?: (ids: string[]) => void;
  /** Fires with the id of a pressed row; unset, rows are not pressable. */
  onItemPress?: (id: string) => void;
  /** Rows draw a divider between them. Defaults to `true`. */
  dividers?: boolean;
  /** Styled slots for every visual part. */
  styled?: {
    /** The list. */
    style?: StyledProp<ViewStyle>;
    /** Every row. */
    styleRow?: StyledProp<ViewStyle>;
    /** The row while it is lifted and dragged (over `styleRow`). */
    styleDragging?: StyledProp<ViewStyle>;
    /** The leading thumbnail. */
    styleImage?: StyledProp<ImageStyle>;
    /** The title. */
    styleTitle?: StyledProp<TextStyle>;
    /** The subtitle. */
    styleSubtitle?: StyledProp<TextStyle>;
    /** The meta text before the handle. */
    styleMeta?: StyledProp<TextStyle>;
    /** The drag handle (its `color` tints the grip). */
    styleHandle?: StyledProp<ViewStyle & { color?: string }>;
    /** The divider. */
    styleDivider?: StyledProp<ViewStyle>;
  };
}

/** The drag in progress: the row, where it started, where it would land and the row heights it was measured with. */
interface ReorderDrag {
  id: string;
  from: number;
  hover: number;
  heights: number[];
}

/**
 * A list whose rows the person puts in order by dragging the handle at the
 * end of each row — a podcast queue, a playlist, priorities. The dragged row
 * lifts (shadow and a slight scale) and the others slide aside; on the drop
 * `onReorder` reports the new order of ids. Every row also offers "Move up" /
 * "Move down" accessibility actions, so the order can be changed without
 * dragging. Rows are not virtualised — keep the list to queue length.
 *
 * @example
 * ```tsx
 * <ReorderableList
 *   items={[
 *     { id: 'e1', title: 'The long game', subtitle: 'Deep Work Radio', meta: '42 min' },
 *     { id: 'e2', title: 'Slow mornings', subtitle: 'Calm Hour', meta: '18 min' },
 *   ]}
 *   onReorder={setQueue}
 * />
 * ```
 *
 * @public
 */
const ReorderableList: ForwardRefExoticComponent<
  PropsWithChildren<ReorderableListProps> &
    RefAttributes<ComponentRef<typeof View>>
> = forwardRef<
  ComponentRef<typeof View>,
  PropsWithChildren<ReorderableListProps>
>(
  (
    {
      items = [],
      onReorder,
      onItemPress,
      dividers = true,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const component = 'ReorderableList';
    const rows = readReorderableItems(items, component);
    const byId = new Map(rows.map((row) => [row.id, row]));
    const rowOf = (id: string): ReorderableListItem => {
      const row = byId.get(id);
      if (!row) throw new Error(`${component}: no item has the id "${id}"`);
      return row;
    };

    // The list keeps its own order until `items` brings a different one.
    const signature = JSON.stringify(rows.map((row) => row.id));
    const [ordered, setOrdered] = useState({
      signature,
      order: rows.map((row) => row.id),
    });
    const order =
      ordered.signature === signature
        ? ordered.order
        : rows.map((row) => row.id);

    const [drag, setDrag] = useState<ReorderDrag | null>(null);
    const dragRef = useRef<ReorderDrag | null>(null);
    const heightsRef = useRef<Record<string, number>>({});
    const [dragY] = useState(() => new Animated.Value(0));
    // The dropped row's translation clears with the frame that shows it in
    // its new place.
    useLayoutEffect(() => {
      if (!drag) dragY.setValue(0);
    }, [drag, dragY]);

    const updateDrag = (next: ReorderDrag | null) => {
      dragRef.current = next;
      setDrag(next);
    };

    const commit = (next: string[]) => {
      setOrdered({ signature, order: next });
      onReorder?.(next);
    };

    const onHeight = (id: string, height: number) => {
      heightsRef.current[id] = height;
    };

    const onDragStart = (id: string) => {
      const from = order.indexOf(id);
      if (from === -1) {
        throw new Error(`${component}: dragged row "${id}" is not in the list`);
      }
      const heights = order.map((rowId) => {
        const height = heightsRef.current[rowId];
        if (height === undefined) {
          throw new Error(`${component}: row "${rowId}" was never laid out`);
        }
        return height;
      });
      dragY.setValue(0);
      updateDrag({ id, from, hover: from, heights });
    };

    const onDragMove = (dy: number) => {
      const current = dragRef.current;
      if (!current) return;
      dragY.setValue(dy);
      const hover = reorderTarget(current.heights, current.from, dy);
      if (hover !== current.hover) updateDrag({ ...current, hover });
    };

    const onDragEnd = () => {
      const current = dragRef.current;
      if (!current) return;
      if (current.hover !== current.from) {
        commit(moveId(order, current.from, current.hover));
      }
      updateDrag(null);
    };

    const onMove = (id: string, direction: -1 | 1) => {
      const from = order.indexOf(id);
      const to = from + direction;
      if (from === -1 || to < 0 || to >= order.length) return;
      commit(moveId(order, from, to));
      AccessibilityInfo.announceForAccessibility(
        `${rowOf(id).title}, position ${to + 1} of ${order.length}`,
      );
    };

    return (
      <StyledView
        ref={ref}
        accessibilityRole="list"
        styled={{ style: [defaults.root, styled?.style] }}
        {...rest}
      >
        {order.map((id, position) => {
          return (
            <ReorderableRow
              key={id}
              item={rowOf(id)}
              position={position}
              count={order.length}
              dragging={drag?.id === id}
              active={drag !== null}
              shift={
                drag
                  ? reorderShift(
                      position,
                      drag.from,
                      drag.hover,
                      drag.heights[drag.from],
                    )
                  : 0
              }
              dragY={dragY}
              divider={dividers && position < order.length - 1}
              styled={styled}
              onHeight={onHeight}
              onDragStart={onDragStart}
              onDragMove={onDragMove}
              onDragEnd={onDragEnd}
              onMove={onMove}
              onPress={onItemPress}
            />
          );
        })}
      </StyledView>
    );
  },
);
ReorderableList.displayName = 'ReorderableList';

export default ReorderableList;
