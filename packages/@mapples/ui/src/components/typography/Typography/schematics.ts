import {
  PropsFormType,
  RegisteredComponent,
  StyleFormType,
} from '@mapples/types';

import Icon from '../../../assets';
import { SystemPalette } from '../../../constants';

import Typography from './Typography';

export const TypographyComponentSchematics: RegisteredComponent = {
  label: 'Typography',
  type: 'Typography',
  Component: Typography,
  hidden: true,
  groupId: 'typography-group',
  Icon: Icon.Typography,
  initialProps: {
    text: 'Text',
    styled: {
      style: {
        color: SystemPalette.text,
      },
    },
  },
  styleKeys: [
    {
      value: 'style',
      label: 'Style',
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
      label: 'Text',
      propsKey: 'text',
      dataProp: true,
    },
    {
      type: PropsFormType.Select,
      label: 'Variant',
      propsKey: 'variant',
      dataProp: false,
      options: 'typography',
    },
  ],
  actionProps: [],
};
