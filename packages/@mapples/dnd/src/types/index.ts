import { FC, PropsWithChildren, ReactElement } from 'react';

import { LayoutRectangle, ViewProps } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import { SvgProps } from 'react-native-svg';

import { Monitor } from '../monitor';

export enum DnDEventType {
  DragStart,
  Drag,
  DragEnd,
  Select,
  Layout,
  LayoutForceUpdate,
}

export interface DnDEvent<
  DragData extends object,
  DropData extends object = DragData,
> {
  type: DnDEventType;
  target?: number | null;
  dropTarget?: DropTarget<DropData> | null;
  dropTargetIndex?: number | null;
  data?: DragData | null;
  dragCoords?: DragCoords | null;
}

export type DragCoords = {
  x: number;
  y: number;
};

export interface DnDContextType<
  DragData extends object,
  DropData extends object = DragData,
> {
  monitor: Monitor<DragData, DropData>;
  isDragging: boolean;
  sv: SharedValue<DragCoords>;
  svOverLayout: SharedValue<LayoutRectangle>;
}

export interface DragItem<T> {
  type: string;
  label: string;
  icon?: FC<SvgProps>;
  data: T;
}

export type DraggableViewProps<T> = PropsWithChildren<ViewProps> & {
  item: DragItem<T>;
};

export type DnDRootViewProps<
  DragData extends object,
  DropData extends object = DragData,
> = PropsWithChildren<ViewProps> & {
  DragElement?: <T>(data: DragItem<T>) => ReactElement;
  onDrop?: (
    event: DnDEvent<DragData, DropData>,
    item: DragItem<DragData>,
  ) => void;
};

export interface DropAreaProps {
  forId: number;
}

export enum FlexDirection {
  Column = 'column',
  Row = 'row',
}

export interface DropTargetLayoutConfig {
  index?: number;
  zIndex?: number;
  flexDirection?: FlexDirection;
}

export interface DropTargetConfig extends DropTargetLayoutConfig {
  canDrop?: boolean;
}

export type LayoutPosition = LayoutRectangle & Required<DropTargetLayoutConfig>;

export interface DropItem<T> {
  layout: LayoutPosition;
  children?: DropTree<T>;
  canDrop?: boolean;
  data?: T;
}

export type DropTree<T> = Map<number, DropItem<T>>;

export interface MonitorConfig {
  padding: number;
  trackOutside?: boolean;
}

export interface DropTarget<T> {
  id: number;
  layout: LayoutPosition;
  index: number;
  canDrop?: boolean;
  children?: DropTree<T>;
  data?: T;
}

export type DragElementTarget<T> = LayoutRectangle & { item: DragItem<T> };
