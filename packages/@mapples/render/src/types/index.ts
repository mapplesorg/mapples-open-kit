import { FC } from 'react';

import { DropTargetConfig } from '@mapples/dnd';
import { RegisteredComponents } from '@mapples/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyObject = Record<string, any>;

export type ChildComponents = Record<string, RenderComponentType>;

export interface DataProp {
  key: string;
  active: boolean;
}

export interface ActionProps {
  type?: string;
  dataProp?: string;
}

export type DataProps = Partial<Record<string, DataProp>>;
export type ActionPropsMap = Partial<Record<string, ActionProps>>;

export interface RenderComponentType {
  id: string;
  type: string;
  props: AnyObject & { zIndex?: number };
  _canvasProps?: DropTargetConfig;
  children: string[];
  childComponents: ChildComponents;
  dataProps?: DataProps;
  actionProps?: ActionPropsMap;
}

export interface RenderDom extends ChildComponents {
  root: RenderComponentType;
}

export type RenderProps = Pick<RenderDom, 'root'> & {
  CustomRenderComponent?: FC<RenderComponentType>;
};

export interface RenderContextType {
  components: RegisteredComponents;
}
