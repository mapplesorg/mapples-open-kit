import { RegisteredComponent, StyleFormType } from '@mapples/types';

import Icon from '../../../assets';
import { SystemPalette } from '../../../constants';

import Pressable from './Pressable';

export const PressableSchematics: RegisteredComponent = {
  label: 'Pressable',
  type: 'Pressable',
  Component: Pressable,
  groupId: 'input-group',
  Icon: Icon.View,
  hasChildren: true,
  initialProps: {
    label: 'Style',
    styled: {
      style: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        backgroundColor: SystemPalette.background,
      },
    },
  },
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
  actionProps: ['onPress', 'onLongPress'],
};
