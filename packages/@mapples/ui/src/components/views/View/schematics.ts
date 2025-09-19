import { RegisteredComponent, StyleFormType } from '@mapples/types';

import Icon from '../../../assets';
import { SystemPalette } from '../../../constants';

import View from './View';

export const ViewSchematic: RegisteredComponent = {
  label: 'View',
  type: 'View',
  Component: View,
  groupId: 'view-group',
  Icon: Icon.View,
  hasChildren: true,
  styleKeys: [
    {
      value: 'style',
      label: 'Style',
      forms: [
        StyleFormType.Dimension,
        StyleFormType.Position,
        StyleFormType.Surface,
        StyleFormType.Spacing,
        StyleFormType.Borders,
        StyleFormType.Shadow,
      ],
    },
  ],
  props: [],
  initialProps: {
    styled: {
      style: {
        width: 200,
        height: 200,
        backgroundColor: SystemPalette.background,
        flexDirection: 'column',
      },
    },
  },
  actionProps: [],
};

export const ContainerSchematic: RegisteredComponent = {
  ...ViewSchematic,
  type: 'Container',
  label: 'Container',
  Icon: Icon.Container,
  initialProps: {
    styled: {
      style: {
        flex: 1,
        backgroundColor: SystemPalette.background,
        flexDirection: 'column',
      },
    },
  },
};
