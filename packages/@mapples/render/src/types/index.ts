import { FC } from 'react';

import { DataProps, RegisteredComponents } from '@mapples/types';

/**
 * A generic object type that can hold any key-value pairs.
 * Used for component props and other dynamic data structures.
 */
export type AnyObject = Record<string, any>;

/**
 * A record of child components indexed by their IDs.
 * Each child component is represented as a RenderComponentType.
 */
export type ChildComponents = Record<string, RenderComponentType>;

/**
 * Configuration for action properties that define component interactions.
 *
 * @interface ActionProps
 * @property [type] - The type of action to perform
 * @property [dataProp] - The data property key to bind to this action
 * @property [staticData] - Literal payload merged into the emitted
 *   `Action.payload.data` (wins over `dataProp` resolution). Use this for
 *   configuration that is known at author time and must not be resolved from
 *   state — e.g. a navigation target (`{ routeName }`). `dataProp` stays for
 *   genuine state binding.
 */
export interface ActionProps {
  type?: string;
  dataProp?: string;
  staticData?: Record<string, unknown>;
}

/**
 * A map of action properties indexed by their names.
 * Each entry contains configuration for component interactions.
 */
export type ActionPropsMap = Partial<Record<string, ActionProps>>;

/**
 * A map of ref properties indexed by their names.
 * Each entry has a ref link in the format ref(assetType:uuid:name)
 */
export type RefPropsMap = Partial<Record<string, string>>;

/**
 * Represents a renderable component with all its configuration and children.
 * This is the core type used throughout the render system.
 *
 * @interface RenderComponentType
 * @property id - Unique identifier for this component instance
 * @property type - The component type name (must be registered in components)
 * @property props - Component props including optional zIndex
 * @property [_canvasProps] - Optional drag-and-drop configuration for canvas interactions
 * @property children - Array of child component IDs
 * @property childComponents - Map of child components by their IDs
 * @property [dataProps] - Optional data property bindings
 * @property [actionProps] - Optional action property configurations
 * @property [refProps] - Optional map of ref property names to asset reference strings (format: `ref(assetType:uuid:name)`)
 */
export interface RenderComponentType {
  id: string;
  type: string;
  props: AnyObject & { zIndex?: number };
  _canvasProps?: AnyObject;
  children: string[];
  childComponents: ChildComponents;
  dataProps?: DataProps;
  actionProps?: ActionPropsMap;
  refProps?: RefPropsMap;
}

/**
 * Represents a state condition used for conditional styling and rendering.
 *
 * State conditions allow components to apply different styles or behaviors
 * based on dynamic state values. The condition string follows the format
 * used by the state package's condition system.
 *
 * @interface StateCondition
 * @property name - The name identifier for this condition
 * @property condition - The condition string (e.g., "user.age::eq::18")
 * @property id - Unique identifier for this condition instance
 * @public
 */
export interface StateCondition {
  name: string;
  condition: string;
  id: string;
}

/**
 * Represents the complete render DOM structure.
 * Extends ChildComponents with a special 'root' component.
 *
 * @interface RenderDom
 * @property root - The root component of the render tree
 */
export interface RenderDom {
  root: RenderComponentType;
  state?: Record<string, StateCondition>;
}

/**
 * Props for the main Render component.
 *
 * @type RenderProps
 * @property root - The root component to render
 * @property [CustomRenderComponent] - Optional custom render component to override default rendering
 */
export type RenderProps = Pick<RenderDom, 'root' | 'state'> & {
  CustomRenderComponent?: FC<RenderComponentType>;
};

/**
 * Context type for the render system.
 * Provides access to registered components throughout the component tree.
 *
 * @interface RenderContextType
 * @property components - Map of registered components available for rendering
 * @property assets - Map of resolved asset values keyed by their ref strings (format: `ref(assetType:uuid:name)`)
 */
export interface RenderContextType {
  components: RegisteredComponents;
  assets: AnyObject;
}
