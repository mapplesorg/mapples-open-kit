import { ComponentType, PropsWithChildren } from 'react';

/**
 * Represents a registered component in the Mapples component system.
 * This interface defines all the metadata and configuration needed to register
 * a component for use in the visual editor.
 *
 * @interface RegisteredComponent
 * @template T - The props type for the component (must extend object)
 *
 * @property {string} type - Unique identifier for the component type
 * @property {ComponentType<PropsWithChildren<T>>} Component - The actual React component
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
  type: string;
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
 * @property {string} key - The key identifier for the data property
 * @property {boolean} active - Whether this data property is currently active
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
