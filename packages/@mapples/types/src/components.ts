import { ComponentType, PropsWithChildren } from 'react';

import { SvgProps } from 'react-native-svg';

/**
 * Represents a registered component in the Mapples component system.
 * This interface defines all the metadata and configuration needed to register
 * a component for use in the visual editor.
 *
 * @interface RegisteredComponent
 * @template T - The props type for the component (must extend object)
 *
 * @property type - Unique identifier for the component type
 * @property Component - The actual React component
 *
 * @example
 * ```typescript
 * const buttonComponent: RegisteredComponent<ButtonProps> = {
 *   type: 'Button',
 *   Component: Button,
 * };
 * ```
 */
export interface RegisteredComponent<T extends object = object> {
  /** Unique string identifier for the component type (e.g. `'Button'`, `'TextInput'`) */
  type: string;
  /** The actual React component to render for this type */
  Component: ComponentType<PropsWithChildren<T>>;
}

/**
 * A record type that maps component type strings to their registered component definitions.
 * This is the main registry structure for all available components in the system.
 *
 * @type RegisteredComponents
 * @example
 * ```typescript
 * const components: RegisteredComponents = {
 *   'Button': buttonComponent,
 *   'TextInput': textInputComponent,
 *   'View': viewComponent
 * };
 * ```
 */
export type RegisteredComponents = Record<string, RegisteredComponent>;

/**
 * Configuration for data properties that can be bound to components.
 *
 * @interface DataProp
 * @property key - The key identifier for the data property
 * @property active - Whether this data property is currently active
 */
export interface DataProp {
  key: string;
  active: boolean;
}

/**
 * A map of data properties indexed by their names.
 * Each entry contains configuration for binding data to components.
 */
export type DataProps = Partial<Record<string, DataProp>>;

/**
 * Represents a lazily-imported SVG module whose default export is an SVG component.
 * Matches the shape produced by `import()` of an `.svg` file with a default export.
 *
 * @interface SvgSource
 */
export interface SvgSource {
  /** The SVG React component exported as the default of an SVG module */
  default: ComponentType<SvgProps>;
}
