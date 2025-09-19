import { ComponentType, PropsWithChildren } from 'react';

import { SvgProps } from 'react-native-svg';

import { PropsFormField, StyleFormType } from './forms';

export interface StyleKey {
  label: string;
  value: string;
  forms: StyleFormType[];
}

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

export interface RegisteredComponentsGroup {
  id: string;
  label: string;
  Icon: ComponentType<SvgProps>;
}

export type RegisteredComponents = Record<string, RegisteredComponent>;
