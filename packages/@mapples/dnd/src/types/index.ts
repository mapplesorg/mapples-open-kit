import { FC, PropsWithChildren, ReactElement } from 'react';

import { LayoutRectangle, ViewProps } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import { SvgProps } from 'react-native-svg';

import { Monitor } from '../monitor';

/**
 * Enum representing the different types of drag and drop events.
 * @public
 */
export enum DnDEventType {
  /** Fired when a drag operation starts */
  DragStart,
  /** Fired during a drag operation when the drag position changes */
  Drag,
  /** Fired when a drag operation ends */
  DragEnd,
  /** Fired when a tap/select event occurs */
  Select,
  /** Fired when layout information is updated */
  Layout,
  /** Fired to force a layout update */
  LayoutForceUpdate,
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
}

/**
 * Type representing a layout position with required configuration properties.
 * @public
 */
export type LayoutPosition = LayoutRectangle & Required<DropTargetLayoutConfig>;

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
}

/**
 * Type representing a drag element target with layout and item information.
 * @template T - The type of data associated with the drag item
 * @public
 */
export type DragElementTarget<T> = LayoutRectangle & { item: DragItem<T> };
