import { FC } from 'react';

import { DropTargetConfig } from '@mapples/dnd';
import { RegisteredComponents } from '@mapples/types';

/**
 * A generic object type that can hold any key-value pairs.
 * Used for component props and other dynamic data structures.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyObject = Record<string, any>;

/**
 * A record of child components indexed by their IDs.
 * Each child component is represented as a RenderComponentType.
 */
export type ChildComponents = Record<string, RenderComponentType>;

/**
 * Configuration for data properties that can be bound to components.
 * 
 * @interface DataProp
 * @property {string} key - The key identifier for the data property
 * @property {boolean} active - Whether this data property is currently active
 */
export interface DataProp {
  key: string;
  active: boolean;
}

/**
 * Configuration for action properties that define component interactions.
 * 
 * @interface ActionProps
 * @property {string} [type] - The type of action to perform
 * @property {string} [dataProp] - The data property key to bind to this action
 */
export interface ActionProps {
  type?: string;
  dataProp?: string;
}

/**
 * A map of data properties indexed by their names.
 * Each entry contains configuration for binding data to components.
 */
export type DataProps = Partial<Record<string, DataProp>>;

/**
 * A map of action properties indexed by their names.
 * Each entry contains configuration for component interactions.
 */
export type ActionPropsMap = Partial<Record<string, ActionProps>>;

/**
 * Represents a renderable component with all its configuration and children.
 * This is the core type used throughout the render system.
 * 
 * @interface RenderComponentType
 * @property {string} id - Unique identifier for this component instance
 * @property {string} type - The component type name (must be registered in components)
 * @property {AnyObject & { zIndex?: number }} props - Component props including optional zIndex
 * @property {DropTargetConfig} [_canvasProps] - Optional drag-and-drop configuration for canvas interactions
 * @property {string[]} children - Array of child component IDs
 * @property {ChildComponents} childComponents - Map of child components by their IDs
 * @property {DataProps} [dataProps] - Optional data property bindings
 * @property {ActionPropsMap} [actionProps] - Optional action property configurations
 */
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

/**
 * Represents the complete render DOM structure.
 * Extends ChildComponents with a special 'root' component.
 * 
 * @interface RenderDom
 * @property {RenderComponentType} root - The root component of the render tree
 */
export interface RenderDom extends ChildComponents {
  root: RenderComponentType;
}

/**
 * Props for the main Render component.
 * 
 * @type RenderProps
 * @property {RenderComponentType} root - The root component to render
 * @property {FC<RenderComponentType>} [CustomRenderComponent] - Optional custom render component to override default rendering
 */
export type RenderProps = Pick<RenderDom, 'root'> & {
  CustomRenderComponent?: FC<RenderComponentType>;
};

/**
 * Context type for the render system.
 * Provides access to registered components throughout the component tree.
 * 
 * @interface RenderContextType
 * @property {RegisteredComponents} components - Map of registered components available for rendering
 */
export interface RenderContextType {
  components: RegisteredComponents;
}
