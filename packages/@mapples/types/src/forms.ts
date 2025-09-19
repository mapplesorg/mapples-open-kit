import { ComponentType } from 'react';
import {AssetType} from "./assets";

export enum StyleFormType {
  Dimension = 'Dimension',
  Image = 'Image',
  Text = 'Text',
  Typography = 'Typography',
  Position = 'Position',
  Surface = 'Surface',
  ScrollSurface = 'ScrollSurface',
  Borders = 'Borders',
  Shadow = 'Shadow',
  Spacing = 'Spacing',
  Svg = 'Svg',
}

export enum PropsFormType {
  Text = 'Text',
  Select = 'Select',
  Switch = 'Switch',
  MultiSelect = 'MultiSelect',
}

export interface PropsFormFieldOption {
  label: string;
  value: string;
}

export type PropsFormFieldOptions =
  | PropsFormFieldOption[]
  | 'typography'
  | AssetType;

export interface PropsFormField {
  propsKey: string;
  label: string;
  options?: PropsFormFieldOptions;
  type: PropsFormType;
  dataProp?: boolean;
}

export interface ActionFormProps {
  propsKey: string;
  label: string;
}

export type PropsFieldConfig = Record<
  PropsFormType,
  ComponentType<PropsFormField>
>;
