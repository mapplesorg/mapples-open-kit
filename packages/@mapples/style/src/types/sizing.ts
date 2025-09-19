import { DimensionValue } from 'react-native';

export type MultiplyValue = `*${number}`;
export type CalcValue = `calc(${string})`;
export type DimensionMultiplyValue = DimensionValue | `*${number}` | CalcValue;

export interface SizingMap {
  [i: string]: DimensionMultiplyValue | SizingMap;
}

export interface SizingConfig {
  base: number;
  sizing: SizingMap;
}

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

export type SizableStyleProps<T> = Partial<
  Record<StyledSizingKeys, DimensionValue | string>
> &
  Omit<T, StyledSizingKeys>;
