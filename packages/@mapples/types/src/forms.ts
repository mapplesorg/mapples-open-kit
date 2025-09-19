import { ComponentType } from 'react';

import { AssetType } from './assets';

/**
 * Enum representing different types of style forms available in the Mapples system.
 * Each form type corresponds to a specific category of styling properties.
 *
 * @enum StyleFormType
 * @example
 * ```typescript
 * const formType = StyleFormType.Dimension; // For width, height, etc.
 * const surfaceForm = StyleFormType.Surface; // For background colors, etc.
 * ```
 */
export enum StyleFormType {
  /** Form for dimension-related properties like width, height, min/max dimensions */
  Dimension = 'Dimension',
  /** Form for image-related properties like background images, object fit */
  Image = 'Image',
  /** Form for text-related properties like color, alignment */
  Text = 'Text',
  /** Form for typography properties like font family, size, weight */
  Typography = 'Typography',
  /** Form for positioning properties like top, left, right, bottom */
  Position = 'Position',
  /** Form for surface properties like background color, opacity */
  Surface = 'Surface',
  /** Form for scrollable surface properties */
  ScrollSurface = 'ScrollSurface',
  /** Form for border properties like border width, color, radius */
  Borders = 'Borders',
  /** Form for shadow properties like box shadow, elevation */
  Shadow = 'Shadow',
  /** Form for spacing properties like margin, padding */
  Spacing = 'Spacing',
  /** Form for SVG-related properties */
  Svg = 'Svg',
}

/**
 * Enum representing different types of property forms for component configuration.
 * These forms are used to create UI controls for editing component properties.
 *
 * @enum PropsFormType
 * @example
 * ```typescript
 * const textField = PropsFormType.Text; // For text input fields
 * const selectField = PropsFormType.Select; // For dropdown selections
 * ```
 */
export enum PropsFormType {
  /** Text input field for string values */
  Text = 'Text',
  /** Single selection dropdown */
  Select = 'Select',
  /** Boolean toggle switch */
  Switch = 'Switch',
  /** Multiple selection dropdown */
  MultiSelect = 'MultiSelect',
}

/**
 * Represents an option in a select or multi-select form field.
 *
 * @interface PropsFormFieldOption
 * @property {string} label - Human-readable display text for the option
 * @property {string} value - The actual value that will be stored
 *
 * @example
 * ```typescript
 * const sizeOption: PropsFormFieldOption = {
 *   label: 'Large',
 *   value: 'lg'
 * };
 * ```
 */
export interface PropsFormFieldOption {
  label: string;
  value: string;
}

/**
 * Union type for form field options. Can be an array of options, a special 'typography' type,
 * or an asset type for asset selection fields.
 *
 * @type PropsFormFieldOptions
 * @example
 * ```typescript
 * // Array of options
 * const sizeOptions: PropsFormFieldOptions = [
 *   { label: 'Small', value: 'sm' },
 *   { label: 'Medium', value: 'md' },
 *   { label: 'Large', value: 'lg' }
 * ];
 *
 * // Special typography type
 * const typographyOptions: PropsFormFieldOptions = 'typography';
 *
 * // Asset type
 * const imageOptions: PropsFormFieldOptions = 'image';
 * ```
 */
export type PropsFormFieldOptions =
  | PropsFormFieldOption[]
  | 'typography'
  | AssetType;

/**
 * Represents a form field configuration for component property editing.
 * This interface defines how a component property should be rendered in the property panel.
 *
 * @interface PropsFormField
 * @property {string} propsKey - The key of the property in the component's props object
 * @property {string} label - Human-readable label for the form field
 * @property {PropsFormFieldOptions} [options] - Options for select/multi-select fields
 * @property {PropsFormType} type - The type of form field to render
 * @property {boolean} [dataProp] - Whether this property is a data property (can be bound to data sources)
 *
 * @example
 * ```typescript
 * const textField: PropsFormField = {
 *   propsKey: 'text',
 *   label: 'Button Text',
 *   type: PropsFormType.Text
 * };
 *
 * const sizeField: PropsFormField = {
 *   propsKey: 'size',
 *   label: 'Size',
 *   type: PropsFormType.Select,
 *   options: [
 *     { label: 'Small', value: 'sm' },
 *     { label: 'Medium', value: 'md' },
 *     { label: 'Large', value: 'lg' }
 *   ]
 * };
 * ```
 */
export interface PropsFormField {
  propsKey: string;
  label: string;
  options?: PropsFormFieldOptions;
  type: PropsFormType;
  dataProp?: boolean;
}

/**
 * Represents a form field configuration for action properties.
 * Action properties are special properties that can trigger actions when interacted with.
 *
 * @interface ActionFormProps
 * @property {string} propsKey - The key of the action property in the component's props object
 * @property {string} label - Human-readable label for the action form field
 *
 * @example
 * ```typescript
 * const onPressAction: ActionFormProps = {
 *   propsKey: 'onPress',
 *   label: 'On Press Action'
 * };
 * ```
 */
export interface ActionFormProps {
  propsKey: string;
  label: string;
}

/**
 * Configuration mapping for form field components.
 * Maps each PropsFormType to its corresponding React component for rendering.
 *
 * @type PropsFieldConfig
 * @example
 * ```typescript
 * const fieldConfig: PropsFieldConfig = {
 *   [PropsFormType.Text]: TextFieldComponent,
 *   [PropsFormType.Select]: SelectFieldComponent,
 *   [PropsFormType.Switch]: SwitchFieldComponent,
 *   [PropsFormType.MultiSelect]: MultiSelectFieldComponent
 * };
 * ```
 */
export type PropsFieldConfig = Record<
  PropsFormType,
  ComponentType<PropsFormField>
>;
