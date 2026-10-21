import { FC, PropsWithChildren, ReactElement } from 'react';

import { LayoutRectangle, ViewProps } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import { SvgProps } from 'react-native-svg';

import type { Monitor } from '../monitor/Monitor';

/**
 * Enum representing the different types of drag and drop events.
 * @public
 */
export enum DnDEventType {
  /** Fired when a drag operation starts */
  DragStart = 'DragStart',
  /** Fired during a drag operation when the drag position changes */
  Drag = 'Drag',
  /** Fired when a drag operation ends */
  DragEnd = 'DragEnd',
  /** Fired when a tap/select event occurs */
  Select = 'Select',
  /** Fired when layout information is updated */
  Layout = 'Layout',
  /** Fired to force a layout update */
  LayoutForceUpdate = 'LayoutForceUpdate',
}

/**
 * Interface representing a drag and drop event with associated data.
 * @template DragData - The type of data being dragged
 * @template DropData - The type of data for drop targets (defaults to DragData)
 * @public
 */
export interface DnDEvent<
  DragData extends object,
  DropData extends object = DragData,
> {
  /** The type of drag and drop event */
  type: DnDEventType;
  /** The ID of the drag target element */
  target?: number | null;
  /** The drop target that the drag is currently over */
  dropTarget?: DropTarget<DropData> | null;
  /** The index position within the drop target */
  dropTargetIndex?: number | null;
  /** The data associated with the drag operation */
  data?: DragData | null;
  /** The current coordinates of the drag operation */
  dragCoords?: DragCoords | null;
  /** The frame the drop target belongs to, when frame spaces are in use */
  frameKey?: string | null;
  /** Whether this drag inserts a new item (palette) or moves an existing one */
  kind?: DragKind;
  /** For `kind: 'move'`: the element being moved and where it came from */
  moveSource?: MoveDragSource | null;
  /** Pointer coords at drag start (drop space) — set on DragEnd */
  dragStartCoords?: DragCoords | null;
  /**
   * Set on `DragEnd` when the pointer was released outside every droppable
   * area. The drag is over — reset any drag-time UI — but no drop happened,
   * so nothing should be inserted, moved or reparented.
   */
  cancelled?: boolean;
}

/**
 * The kind of drag operation: a palette insert, a move of an existing canvas
 * element, or a drag that started outside the app entirely (files dragged in
 * from the OS — no drag element is ever registered for those).
 * @public
 */
export type DragKind = 'palette' | 'move' | 'external';

/**
 * Identifies the element a move-drag started on.
 * @public
 */
export interface MoveDragSource {
  /** Monitor drop-element id of the dragged element */
  dropId: number;
  /** Application-level component id (from the drop target's data) */
  componentId: string;
  /** Frame the element lives in, if any */
  frameKey: string | null;
  /** Pointer offset from the element's top-left corner at drag start */
  grabOffset: DragCoords;
}

/**
 * Type representing the coordinates of a drag operation.
 * @public
 */
export type DragCoords = {
  /** The x-coordinate */
  x: number;
  /** The y-coordinate */
  y: number;
};

/**
 * Interface representing the drag and drop context type.
 * @template DragData - The type of data being dragged
 * @template DropData - The type of data for drop targets (defaults to DragData)
 * @public
 */
export interface DnDContextType<
  DragData extends object,
  DropData extends object = DragData,
> {
  /** The monitor instance that tracks drag and drop operations */
  monitor: Monitor<DragData, DropData>;
  /** Whether a drag operation is currently active */
  isDragging: boolean;
  /** Shared value for drag coordinates */
  sv: SharedValue<DragCoords>;
  /** Shared value for overlay layout information */
  svOverLayout: SharedValue<LayoutRectangle>;
}

/**
 * Interface representing a draggable item with metadata and data.
 * @template T - The type of data associated with the drag item
 * @public
 */
export interface DragItem<T> {
  /** The type identifier for the drag item */
  type: string;
  /** The display label for the drag item */
  label: string;
  /** Optional icon component for the drag item */
  icon?: FC<SvgProps>;
  /** The data payload associated with the drag item */
  data: T;
}

/**
 * Props type for a draggable view component.
 * @template T - The type of data associated with the drag item
 * @public
 */
export type DraggableViewProps<T> = PropsWithChildren<ViewProps> & {
  /** The drag item configuration */
  item: DragItem<T>;
};

/**
 * Props type for the root drag and drop view component.
 * @template DragData - The type of data being dragged
 * @template DropData - The type of data for drop targets (defaults to DragData)
 * @public
 */
export type DnDRootViewProps<
  DragData extends object,
  DropData extends object = DragData,
> = PropsWithChildren<ViewProps> & {
  /** Optional custom drag element renderer */
  DragElement?: <T>(data: DragItem<T>) => ReactElement;
  /** Callback fired when a drop operation completes */
  onDrop?: (
    event: DnDEvent<DragData, DropData>,
    item: DragItem<DragData>,
  ) => void;
  /**
   * Converts absolute window pointer coordinates into the coordinate space
   * drop targets are hit-tested in (e.g. an infinite canvas's world space).
   * Drag *sources* keep window-space hit testing regardless. Omit for the
   * default 1:1 window space.
   *
   * Return `null` for points that lie outside that space altogether (over
   * surrounding chrome, say). The drag then counts as being over nothing —
   * hovering there clears the pending drop and releasing there cancels it —
   * rather than mapping onto whatever the space extrapolates to.
   */
  pointerTransform?: (point: DragCoords) => DragCoords | null;
};

/**
 * Props interface for the drop area component.
 * @public
 */
export interface DropAreaProps {
  /** The ID of the parent drop target this area belongs to */
  forId: number;
}

/**
 * Enum representing the flex direction for drop target layouts.
 * @public
 */
export enum FlexDirection {
  /** Vertical layout (column) */
  Column = 'column',
  /** Horizontal layout (row) */
  Row = 'row',
}

/**
 * Interface for configuring drop target layout properties.
 * @public
 */
export interface DropTargetLayoutConfig {
  /** The index position within the parent container */
  index?: number;
  /** The z-index for layering */
  zIndex?: number;
  /** The flex direction for child elements */
  flexDirection?: FlexDirection;
}

/**
 * Interface for configuring drop target behavior and layout.
 * @public
 */
export interface DropTargetConfig extends DropTargetLayoutConfig {
  /** Whether this drop target can accept drops */
  canDrop?: boolean;
  /**
   * When `false`, the element is not registered with the monitor at all — it
   * takes part in no hit-testing, selection, or drops. Lets a consumer switch
   * an already-mounted tree between editable and inert (e.g. an editor's
   * preview mode) WITHOUT remounting it: registration follows the flag while
   * the component identity — and therefore its rendered subtree — stays put.
   */
  enabled?: boolean;
  /**
   * Marks a root-level drop element as the root of a frame coordinate space:
   * its own layout and every descendant's layout are stored relative to the
   * frame origin registered via {@link Monitor.registerFrame}. Hit testing
   * converts world coordinates into that space mathematically, so frame
   * content never needs re-measuring on viewport pan/zoom or frame moves.
   */
  frameKey?: string;
}

/**
 * A frame coordinate space: a world-space origin and device-space size.
 * @public
 */
export interface FrameEntry {
  /** World-space position of the frame's top-left corner */
  origin: DragCoords;
  /** Frame size in world units (content may extend below `height`) */
  size: { width: number; height: number };
}

/**
 * Type representing a layout position with required configuration properties.
 * @public
 */
/** A measured rectangle the monitor updates in place (React Native 0.88 types `LayoutRectangle` read-only). */
type MutableLayoutRectangle = {
  -readonly [K in keyof LayoutRectangle]: LayoutRectangle[K];
};

export type LayoutPosition = MutableLayoutRectangle &
  Required<DropTargetLayoutConfig>;

/**
 * Interface representing a drop item with layout and data information.
 * @template T - The type of data associated with the drop item
 * @public
 */
export interface DropItem<T> {
  /** The layout position and configuration */
  layout: LayoutPosition;
  /** Optional child drop items */
  children?: DropTree<T>;
  /** Whether this item can accept drops */
  canDrop?: boolean;
  /** Optional data associated with this drop item */
  data?: T;
  /** Frame space this subtree's layouts are relative to (root items only) */
  frameKey?: string;
}

/**
 * Type representing a tree structure of drop items.
 * @template T - The type of data associated with the drop items
 * @public
 */
export type DropTree<T> = Map<number, DropItem<T>>;

/**
 * Interface for configuring the drag and drop monitor.
 * @public
 */
export interface MonitorConfig {
  /** Padding around drop targets for hit detection */
  padding: number;
  /** Whether to track drag operations outside the root element */
  trackOutside?: boolean;
}

/**
 * Interface representing a drop target with all its properties.
 * @template T - The type of data associated with the drop target
 * @public
 */
export interface DropTarget<T> {
  /** Unique identifier for the drop target */
  id: number;
  /** Layout position and configuration */
  layout: LayoutPosition;
  /** Index position within the parent */
  index: number;
  /** Whether this target can accept drops */
  canDrop?: boolean;
  /** Optional child drop targets */
  children?: DropTree<T>;
  /** Optional data associated with this drop target */
  data?: T;
  /** Frame space the layout is relative to, when inside a frame */
  frameKey?: string | null;
  /**
   * The pointer coordinates converted into this target's own coordinate
   * space at hit-test time (frame-local inside frames). Consumers comparing
   * pointer position against `layout` must use these, not raw event coords.
   */
  hitCoords?: DragCoords;
}

/**
 * Type representing a drag element target with layout and item information.
 * @template T - The type of data associated with the drag item
 * @public
 */
export type DragElementTarget<T> = LayoutRectangle & { item: DragItem<T> };
