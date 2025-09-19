import {
  PropsFormType,
  RegisteredComponent,
  StyleFormType,
} from '@mapples/types';

import Icon from '../../../assets';
import { SystemPalette } from '../../../constants';

import Button from './Button';

export const ButtonSchematic: RegisteredComponent = {
  label: 'Button',
  type: 'Button',
  Component: Button,
  groupId: 'input-group',
  Icon: Icon.Button,
  initialProps: {
    label: 'Button',
    styled: {
      style: {
        width: '100%',
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
      },
      styleTypography: {
        color: SystemPalette.text,
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
    {
      value: 'styleTypography',
      label: 'Button text',
      forms: [
        StyleFormType.Typography,
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
      type: PropsFormType.Text,
      label: 'Label',
      propsKey: 'label',
    },
    {
      type: PropsFormType.Select,
      label: 'Variant',
      propsKey: 'typographyVariant',
      dataProp: false,
      options: 'typography',
    },
  ],
  actionProps: ['onPress', 'onLongPress'],
};
