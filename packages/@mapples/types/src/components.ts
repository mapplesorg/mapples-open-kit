import { ComponentType, PropsWithChildren } from 'react';

import { SvgProps } from 'react-native-svg';

import { PropsFormField, StyleFormType } from './forms';

/**
 * Represents a style key configuration for component styling.
 * 
 * @interface StyleKey
 * @property {string} label - Human-readable label for the style key
 * @property {string} value - The actual CSS property name or identifier
 * @property {StyleFormType[]} forms - Array of form types that can be used to configure this style
 * 
 * @example
 * ```typescript
 * const backgroundColorStyle: StyleKey = {
 *   label: 'Background Color',
 *   value: 'backgroundColor',
 *   forms: [StyleFormType.Surface]
 * };
 * ```
 */
export interface StyleKey {
  label: string;
  value: string;
  forms: StyleFormType[];
}

/**
 * Represents a registered component in the Mapples component system.
 * This interface defines all the metadata and configuration needed to register
 * a component for use in the visual editor.
 * 
 * @interface RegisteredComponent
 * @template T - The props type for the component (must extend object)
 * 
 * @property {string} type - Unique identifier for the component type
 * @property {string} groupId - ID of the group this component belongs to
 * @property {string} label - Human-readable display name for the component
 * @property {ComponentType<PropsWithChildren<T>>} Component - The actual React component
 * @property {ComponentType<SvgProps>} Icon - SVG icon component for the component palette
 * @property {T} initialProps - Default props for the component when first created
 * @property {StyleKey[]} styleKeys - Available style properties for this component
 * @property {PropsFormField[]} props - Form fields for configuring component props
 * @property {string[]} actionProps - List of prop names that can trigger actions
 * @property {boolean} [hidden] - Whether the component should be hidden from the palette
 * @property {boolean} [hasChildren] - Whether the component can contain child components
 * 
 * @example
 * ```typescript
 * const buttonComponent: RegisteredComponent<ButtonProps> = {
 *   type: 'Button',
 *   groupId: 'inputs',
 *   label: 'Button',
 *   Component: Button,
 *   Icon: ButtonIcon,
 *   initialProps: { text: 'Click me' },
 *   styleKeys: [backgroundColorStyle, textColorStyle],
 *   props: [textField, disabledField],
 *   actionProps: ['onPress']
 * };
 * ```
 */
export interface RegisteredComponent<T extends object = object> {
  type: string;
  groupId: string;
  label: string;
  Component: ComponentType<PropsWithChildren<T>>;
  Icon: ComponentType<SvgProps>;
  initialProps: T;
  styleKeys: StyleKey[];
  props: PropsFormField[];
  actionProps: string[];
  hidden?: boolean;
  hasChildren?: boolean;
}

/**
 * Represents a group of registered components in the component palette.
 * Groups are used to organize components into logical categories.
 * 
 * @interface RegisteredComponentsGroup
 * @property {string} id - Unique identifier for the group
 * @property {string} label - Human-readable display name for the group
 * @property {ComponentType<SvgProps>} Icon - SVG icon component for the group
 * 
 * @example
 * ```typescript
 * const inputsGroup: RegisteredComponentsGroup = {
 *   id: 'inputs',
 *   label: 'Inputs',
 *   Icon: InputsIcon
 * };
 * ```
 */
export interface RegisteredComponentsGroup {
  id: string;
  label: string;
  Icon: ComponentType<SvgProps>;
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
