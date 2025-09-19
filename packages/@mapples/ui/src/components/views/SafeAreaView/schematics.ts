import {
  PropsFormType,
  RegisteredComponent,
  StyleFormType,
} from '@mapples/types';

import Icon from '../../../assets';
import { SystemPalette } from '../../../constants';

import SafeAreaView from './SafeAreaView';

export const SafeAreaViewSchematic: RegisteredComponent = {
  label: 'Safe Area View',
  type: 'SafeAreaView',
  Component: SafeAreaView,
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
  props: [
    {
      label: 'Safe area edges',
      propsKey: 'edges',
      type: PropsFormType.MultiSelect,
      options: [
        {
          value: 'top',
          label: 'Top',
        },
        {
          value: 'bottom',
          label: 'Bottom',
        },
        {
          value: 'left',
          label: 'Left',
        },
        {
          value: 'right',
          label: 'Right',
        },
      ],
    },
  ],
  initialProps: {
    styled: {
      style: {
        width: '100%',
        height: '100%',
        backgroundColor: SystemPalette.background,
        flexDirection: 'column',
      },
    },
  },
  actionProps: [],
};
