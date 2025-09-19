import {
  PropsFormType,
  RegisteredComponent,
  StyleFormType,
} from '@mapples/types';

import Icon from '../../../assets';
import { SystemPalette } from '../../../constants';

import IconComponent from './Icon';

export const IconSchematics: RegisteredComponent = {
  label: 'Icon',
  type: 'Icon',
  Component: IconComponent,
  groupId: 'media-group',
  Icon: Icon.Image,
  initialProps: {
    uri: '',
    styled: {
      style: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
      },
      styleSvg: {
        width: 24,
        height: 24,
        color: SystemPalette.text,
      },
    },
  },
  styleKeys: [
    {
      value: 'style',
      label: 'Container',
      forms: [
        StyleFormType.Dimension,
        StyleFormType.Position,
        StyleFormType.Surface,
        StyleFormType.Spacing,
      ],
    },
    {
      value: 'styleSvg',
      label: 'Icon',
      forms: [StyleFormType.Svg, StyleFormType.Position],
    },
  ],
  props: [
    {
      type: PropsFormType.Select,
      label: 'Source',
      propsKey: 'uri',
      options: 'icon',
    },
  ],
  actionProps: [],
};
