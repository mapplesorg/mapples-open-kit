import { DimensionValue } from 'react-native';

/** Multiplier value format: `*number` (e.g., `*2` for 2 times base size) */
export type MultiplyValue = `*${number}`;

/** CSS calc() value format: `calc(expression)` */
export type CalcValue = `calc(${string})`;

/** Dimension value that can be a standard dimension, multiplier, or calc expression */
export type DimensionMultiplyValue = DimensionValue | `*${number}` | CalcValue;

/**
 * Sizing map structure that allows nested size definitions.
 * Can contain dimension values or nested sizing maps for organization.
 */
export interface SizingMap {
  [i: string]: DimensionMultiplyValue | SizingMap;
}

/**
 * Sizing configuration for consistent spacing and sizing across the application.
 * Defines base size and sizing scale for components.
 */
export interface SizingConfig {
  /** Base size value used for calculations and multipliers */
  base: number;
  /** Map of size names to their corresponding values */
  sizing: SizingMap;
}

/** Style properties that support sizing values (dimensions, multipliers, calc expressions) */
export type StyledSizingKeys =
  | 'width'
  | 'minWidth'
  | 'maxWidth'
  | 'height'
  | 'minHeight'
  | 'maxHeight'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'padding'
  | 'paddingTop'
  | 'paddingBottom'
  | 'paddingLeft'
  | 'paddingRight'
  | 'paddingHorizontal'
  | 'paddingVertical'
  | 'margin'
  | 'marginTop'
  | 'marginBottom'
  | 'marginLeft'
  | 'marginRight'
  | 'marginHorizontal'
  | 'marginVertical'
  | 'gap'
  | 'rowGap'
  | 'columnGap'
  | 'borderRadius'
  | 'borderTopLeftRadius'
  | 'borderTopRightRadius'
  | 'borderBottomLeftRadius'
  | 'borderBottomRightRadius'
  | 'borderWidth'
  | 'borderTopWidth'
  | 'borderBottomWidth'
  | 'borderLeftWidth'
  | 'borderRightWidth';

/**
 * Style props type that allows sizing values for dimension-related properties.
 * Replaces standard dimension properties with enhanced sizing support.
 */
export type SizableStyleProps<T> = Partial<
  Record<StyledSizingKeys, DimensionValue | string>
> &
  Omit<T, StyledSizingKeys>;
